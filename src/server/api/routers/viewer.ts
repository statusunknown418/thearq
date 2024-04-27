import { LinearClient } from "@linear/sdk";
import { Octokit } from "@octokit/core";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { object, z } from "zod";
import { INTEGRATIONS, RECENT_W_ID_KEY } from "~/lib/constants";
import { secondsToHoursDecimal } from "~/lib/stores/events-store";
import { redis } from "~/server/upstash";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type IntegrationCachingKey } from "./integrations";

export const viewerRouter = createTRPCRouter({
  getIntegrations: protectedProcedure.query(({ ctx }) => {
    const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

    return ctx.db.query.integrations.findMany({
      where: (t, op) => {
        return op.and(
          op.eq(t.userId, ctx.session.user.id),
          op.eq(t.workspaceId, Number(workspaceId)),
          op.eq(t.enabled, true),
        );
      },
      columns: {
        provider: true,
        enabled: true,
        userId: true,
        providerAccountId: true,
      },
    });
  }),

  getAvailableIntegrations: protectedProcedure.query(({ ctx }) => {
    const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

    if (!workspaceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected try navigating to another workspace.",
      });
    }

    return ctx.db.query.integrations.findMany({
      where: (t, op) => {
        return op.and(
          op.eq(t.userId, ctx.session.user.id),
          op.eq(t.workspaceId, Number(workspaceId)),
        );
      },
      columns: {
        provider: true,
        enabled: true,
        userId: true,
        providerAccountId: true,
      },
    });
  }),

  getGithubIssues: protectedProcedure
    .input(
      object({
        queryType: z.enum(["is:issue", "is:pull-request"]).default("is:issue"),
        searchString: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace found",
        });
      }

      const key: IntegrationCachingKey = `${ctx.session.user.id}:${INTEGRATIONS.github.name}`;

      const token = await redis.get<{ access_token: string; providerAccountId: string }>(key);

      if (!token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No token found",
        });
      }

      const client = new Octokit({
        auth: token.access_token,
      });

      const issues = await client.request("GET /search/issues", {
        q: `${input.searchString ?? ""} ${input.queryType} is:open author:${token.providerAccountId} archived:false`,
      });

      return issues.data.items ?? [];
    }),

  getLinearIssues: protectedProcedure
    .input(
      object({
        searchString: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace found",
        });
      }

      const key: IntegrationCachingKey = `${ctx.session.user.id}:${INTEGRATIONS.linear.name}`;

      const token = await redis.get<{ access_token: string }>(key);

      if (!token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No token found",
        });
      }

      const client = new LinearClient({
        accessToken: token.access_token,
      });

      const viewer = await client.viewer;

      const issuesAssigned = await viewer.assignedIssues({
        filter: {
          title: {
            contains: input.searchString,
          },
        },
      });

      return issuesAssigned.nodes;
    }),

  getAssignedProjects: protectedProcedure.query(({ ctx }) => {
    const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

    if (!workspaceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace found",
      });
    }

    return ctx.db.query.usersOnProjects.findMany({
      where: (t, { eq }) => eq(t.userId, ctx.session.user.id),
      with: {
        project: {
          columns: {
            id: true,
            name: true,
            description: true,
            identifier: true,
            color: true,
            budgetHours: true,
            type: true,
            startsAt: true,
            endsAt: true,
            shareableUrl: true,
          },
        },
      },
    });
  }),

  getAnalyticsMetrics: protectedProcedure
    .input(
      object({
        workspaceId: z.number(),
        monthDate: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace found",
        });
      }

      const summary = await ctx.db.query.timeEntries.findMany({
        where: (t, op) => {
          return op.and(
            op.eq(t.workspaceId, input.workspaceId),
            op.eq(t.monthDate, input.monthDate),
            op.eq(t.userId, ctx.session.user.id),
          );
        },
        with: {
          project: {
            columns: {
              color: true,
              name: true,
              identifier: true,
              id: true,
            },
            with: {
              users: {
                columns: {
                  billableRate: true,
                  weekCapacity: true,
                  userId: true,
                },
                where: (t, op) => op.eq(t.userId, ctx.session.user.id),
              },
            },
          },
          workspace: {
            with: {
              users: {
                columns: {
                  defaultBillableRate: true,
                  defaultWeekCapacity: true,
                  active: true,
                  userId: true,
                },
                where: (t, op) => op.eq(t.userId, ctx.session.user.id),
              },
            },
          },
        },
      });

      const totalHours = summary.reduce((acc, curr) => acc + curr.duration, 0);
      const user = summary.at(0)?.workspace.users.find((u) => u.userId === ctx.session.user.id);

      // Compute total earnings for user based on its billable rate
      const totalEarnings = summary.reduce((acc, curr) => {
        const project = curr.project;
        const userProject = project?.users.find((u) => u.userId === ctx.session.user.id);

        if (!user) {
          return acc;
        }

        if (!project || !userProject) {
          return acc + secondsToHoursDecimal(curr.duration) * user.defaultBillableRate;
        }

        const billableRate = userProject.billableRate;
        const duration = secondsToHoursDecimal(curr.duration);

        return acc + duration * billableRate;
      }, 0);

      const orderProjectsByHours = summary
        .sort((a, b) => {
          if (!a.project) {
            return 1;
          }

          if (!b.project) {
            return -1;
          }

          return b.duration - a.duration;
        })
        .map((entry) => {
          return {
            project: entry.project,
            duration: entry.duration,
          };
        });

      const overtime = summary.reduce((acc, curr) => {
        const project = curr.project;
        const userProject = project?.users.find((u) => u.userId === ctx.session.user.id);

        if (!user) {
          return acc;
        }

        if (!project || !userProject) {
          return acc;
        }

        const weekCapacity = userProject.weekCapacity ?? user.defaultWeekCapacity;
        const duration = secondsToHoursDecimal(curr.duration);

        return acc + Math.max(duration - (weekCapacity ?? 0), 0);
      }, 0);

      return {
        totalHours,
        totalEarnings,
        summary,
        orderProjectsByHours,
        overtime,
      };
    }),
});
