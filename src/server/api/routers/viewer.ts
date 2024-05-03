import { LinearClient } from "@linear/sdk";
import { Octokit } from "@octokit/core";
import { TRPCError } from "@trpc/server";
import { addDays, differenceInDays, format } from "date-fns";
import { cookies } from "next/headers";
import { object, z } from "zod";
import { INTEGRATIONS, RECENT_W_ID_KEY } from "~/lib/constants";
import { redis } from "~/server/upstash";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type IntegrationCachingKey } from "./integrations";
import { secondsToHoursDecimal } from "~/lib/dates";

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
        from: z.string().optional(),
        to: z.string().optional(),
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

      const [summary, workspace] = await ctx.db.transaction(async (trx) => {
        const workspace = await trx.query.workspaces.findFirst({
          where: (t, op) => op.and(op.eq(t.id, input.workspaceId)),
        });

        const data = await trx.query.timeEntries.findMany({
          where: (t, op) => {
            return op.and(
              op.eq(t.workspaceId, input.workspaceId),
              op.eq(t.userId, ctx.session.user.id),
              input.from ? op.gte(t.trackedAt, new Date(input.from)) : undefined,
              input.to ? op.lte(t.trackedAt, new Date(input.to)) : undefined,
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

        return [data, workspace];
      });

      const totalHours = summary.reduce(
        (acc, curr) => acc + secondsToHoursDecimal(curr.duration),
        0,
      );
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

      const projectsByHoursCompound = summary.reduce(
        (acc, curr) => {
          const project = curr.project;
          const duration = secondsToHoursDecimal(curr.duration);

          if (!user) {
            return acc;
          }

          if (acc["no-project"] && !project) {
            acc["no-project"].duration += duration;
            return acc;
          }

          if (!project) {
            acc["no-project"] = {
              name: "No project",
              color: "#000",
              identifier: null,
              duration,
            };
            return acc;
          }

          const existing = acc[project.id];

          if (!existing) {
            acc[project.id] = {
              name: project.name,
              color: project.color,
              identifier: project.identifier,
              duration,
            };
          } else {
            acc[project.id] = {
              ...existing,
              duration: existing.duration + duration,
            };
          }

          return acc;
        },
        {} as Record<
          string,
          { name: string; color: string; duration: number; identifier: string | null }
        >,
      );

      const projectsByHours = Object.values(projectsByHoursCompound);

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

      const payDate = workspace?.globalPaymentSchedule;

      return {
        totalHours,
        totalEarnings,
        projectsByHours,
        overtime,
        capacity: user?.defaultWeekCapacity,
        payDate,
      };
    }),

  getAnalyticsCharts: protectedProcedure
    .input(
      object({
        workspaceId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
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
            op.eq(t.userId, ctx.session.user.id),
            op.gte(t.trackedAt, new Date(input.startDate)),
            op.lte(t.trackedAt, new Date(input.endDate)),
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

      const difference = differenceInDays(new Date(input.endDate), new Date(input.startDate));

      const hoursPerDate = summary.reduce(
        (acc, curr) => {
          const date = format(curr.start, "MM/dd");
          const duration = secondsToHoursDecimal(curr.duration);

          if (!acc[date]) {
            acc[date] = 0;
          }

          acc[date] += duration;

          return acc;
        },
        {} as Record<string, number>,
      );

      const totalHoursPerDay = Array.from({ length: difference + 1 }).map((_, index) => {
        const date = format(addDays(new Date(input.startDate), index), "MM/dd");
        const hours = hoursPerDate[date] ?? 0;

        return {
          date,
          time: hours,
        };
      });

      return totalHoursPerDay;
    }),
});
