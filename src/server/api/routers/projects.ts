import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { differenceInDays, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import slugify from "slugify";
import { number, object, optional, parse, string } from "valibot";
import { RECENT_W_ID_KEY, VERCEL_REQUEST_LOCATION } from "~/lib/constants";
import { secondsToHoursDecimal } from "~/lib/dates";
import { parseCurrency } from "~/lib/parsers";
import { adminPermissions, parsePermissions, type UserPermissions } from "~/lib/stores/auth-store";
import { projects, projectsSchema, usersOnProjects } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const hasServer = (perms: UserPermissions, data: string) => {
  const formatted = parsePermissions(data);
  return formatted.includes(perms);
};

export const projectsRouter = createTRPCRouter({
  getDetails: protectedProcedure
    .input((i) => parse(object({ shareableUrl: string() }), i))
    .query(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!input.shareableUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "shareableUrl is required",
        });
      }

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const data = await ctx.db.transaction(async (trx) => {
        const project = await trx.query.projects.findFirst({
          where: (t, { eq }) => eq(t.shareableUrl, input.shareableUrl),
          with: {
            client: true,
          },
        });

        if (!project) {
          trx.rollback();
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Project not found",
          });
        }

        const userOnProject = await trx.query.usersOnProjects.findFirst({
          where: (t, { and, eq }) =>
            and(eq(t.projectId, project.id), eq(t.userId, ctx.session.user.id)),
        });

        return {
          ...userOnProject,
          project,
        };
      });

      if (!data || data.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to view this project",
        });
      }

      return data;
    }),
  get: protectedProcedure.query(async ({ ctx }) => {
    const wId = cookies().get(RECENT_W_ID_KEY)?.value;
    const location = ctx.headers.get(VERCEL_REQUEST_LOCATION);

    if (!wId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected try navigating to another workspace.",
      });
    }

    const data = await ctx.db.query.usersOnProjects.findMany({
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
          with: {
            client: true,
          },
        },
      },
    });

    return data.map((d) => ({
      ...d,
      project: {
        ...d.project,
        startsAt: d.project.startsAt ? toZonedTime(d.project.startsAt, location ?? "UTC") : null,
        endsAt: d.project.endsAt ? toZonedTime(d.project.endsAt, location ?? "UTC") : null,
      },
    }));
  }),

  create: protectedProcedure
    .input((i) => parse(projectsSchema, i))
    .mutation(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const createdId = createId();
      const prefix = input.identifier ? `${input.identifier}-` : "";
      const shareableUrl = slugify(`${prefix}${createdId}`);

      const data = await ctx.db.transaction(async (trx) => {
        let selectedWorkspace;

        try {
          selectedWorkspace = await trx.query.usersOnWorkspaces.findFirst({
            where: (t, { eq }) => eq(t.workspaceId, Number(wId)),
          });

          if (selectedWorkspace?.role !== "admin") {
            trx.rollback();
          }
        } catch (err) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not allowed to create a project",
          });
        }

        const [project] = await trx
          .insert(projects)
          .values({
            ...input,
            workspaceId: Number(wId),
            ownerId: ctx.session.user.id,
            shareableUrl,
          })
          .returning();

        if (!project) {
          trx.rollback();
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed when creating a project",
          });
        }

        await trx.insert(usersOnProjects).values({
          projectId: project.id,
          userId: ctx.session.user.id,
          workspaceId: Number(wId),
          role: "admin",
          permissions: JSON.stringify(adminPermissions),
          billableRate: selectedWorkspace?.defaultBillableRate,
          weekCapacity: selectedWorkspace?.defaultWeekCapacity,
        });

        return project;
      });

      return data;
    }),
  edit: protectedProcedure
    .input((i) => parse(projectsSchema, i))
    .mutation(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "projectId is required",
        });
      }

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const data = await ctx.db.transaction(async (trx) => {
        const allowed = await trx.query.usersOnProjects.findFirst({
          where: (t, { eq, and }) =>
            and(eq(t.projectId, input.id!), eq(t.userId, ctx.session.user.id)),
        });

        if (!allowed?.userId) {
          trx.rollback();
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not allowed to edit this project",
          });
        }

        return await trx.update(projects).set(input).where(eq(projects.id, input.id!)).returning();
      });

      return data;
    }),
  delete: protectedProcedure
    .input((i) => parse(object({ id: number() }), i))
    .mutation(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "projectId is required",
        });
      }

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const data = await ctx.db.delete(projects).where(eq(projects.id, input.id));

      return data;
    }),

  getRevenueCharts: protectedProcedure
    .input((i) =>
      parse(
        object({
          projectShareableId: string(),
          start: optional(string()),
          end: optional(string()),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const location = headers().get(VERCEL_REQUEST_LOCATION);
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      const defaultRange = {
        start: toZonedTime(startOfMonth(new Date()), location ?? "UTC"),
        end: toZonedTime(new Date(), location ?? "UTC"),
      };

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const charts = await ctx.db.transaction(async (trx) => {
        const project = await trx.query.projects.findFirst({
          where: (t, { eq }) => eq(t.shareableUrl, input.projectShareableId),
        });

        if (!project) {
          trx.rollback();
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Project not found",
          });
        }

        const data = await trx.query.usersOnProjects.findMany({
          where: (t, { eq, and }) => and(eq(t.projectId, project.id)),
          with: {
            user: {
              with: {
                timeEntries: {
                  where: (t, { and, eq, gte, lte }) =>
                    and(
                      eq(t.workspaceId, Number(wId)),
                      eq(t.projectId, project.id),
                      gte(t.trackedAt, input.start ? new Date(input.start) : defaultRange.start),
                      lte(t.trackedAt, input.end ? new Date(input.end) : defaultRange.end),
                    ),
                },
              },
            },
          },
        });

        return data;
      });

      const revenue = charts.reduce((acc, curr) => {
        return (
          acc +
          curr.user.timeEntries.reduce(
            (a, c) => a + secondsToHoursDecimal(c.duration) * curr.billableRate,
            0,
          )
        );
      }, 0);

      return {
        revenue: parseCurrency(revenue),
        charts,
      };
    }),

  getAnalyticsCharts: protectedProcedure
    .input((i) =>
      parse(
        object({
          projectShareableId: string(),
          start: optional(string()),
          end: optional(string()),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const location = headers().get(VERCEL_REQUEST_LOCATION);
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      const defaultRange = {
        start: toZonedTime(startOfMonth(new Date()), location ?? "UTC"),
        end: toZonedTime(new Date(), location ?? "UTC"),
      };

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const charts = await ctx.db.transaction(async (trx) => {
        const project = await trx.query.projects.findFirst({
          where: (t, { eq }) => eq(t.shareableUrl, input.projectShareableId),
        });

        if (!project) {
          trx.rollback();
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Project not found",
          });
        }

        const data = await trx.query.timeEntries.findMany({
          where: (t, { eq, and, gte, lte }) => {
            return and(
              eq(t.workspaceId, Number(wId)),
              eq(t.projectId, project.id),
              input.start
                ? gte(t.trackedAt, new Date(input.start))
                : gte(t.trackedAt, defaultRange.start),
              input.end
                ? lte(t.trackedAt, new Date(input.end))
                : lte(t.trackedAt, defaultRange.end),
            );
          },
        });

        return data;
      });

      return charts;
    }),
});
