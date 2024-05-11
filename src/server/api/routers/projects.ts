import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { addDays, differenceInDays, endOfMonth, startOfMonth } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import slugify from "slugify";
import { number, object, parse, string } from "valibot";
import { RECENT_W_ID_KEY, VERCEL_REQUEST_LOCATION } from "~/lib/constants";
import { adjustEndDate as adjustedEndDate, secondsToHoursDecimal } from "~/lib/dates";
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
          start: string(),
          end: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const difference = differenceInDays(new Date(input.end), new Date(input.start));
      const [charts, project] = await ctx.db.transaction(async (trx) => {
        const project = await trx.query.projects.findFirst({
          where: (t, { eq }) => eq(t.shareableUrl, input.projectShareableId),
          with: {
            users: true,
          },
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
              gte(t.start, new Date(input.start)),
              lte(t.start, adjustedEndDate(input.end)),
            );
          },
        });

        return [data, project];
      });

      const totalRevenue = charts.reduce((acc, curr) => {
        const user = project?.users?.find((u) => u.userId === curr.userId);
        const rate = user?.billableRate ?? 0;
        const hours = secondsToHoursDecimal(curr.duration);
        return acc + rate * hours;
      }, 0);

      const totalCost = charts.reduce((acc, curr) => {
        const user = project?.users?.find((u) => u.userId === curr.userId);
        const cost = user?.internalCost ?? 0;
        const hours = secondsToHoursDecimal(curr.duration);
        return acc + cost * hours;
      }, 0);

      const arrayT1 = performance.now();
      const revenueAndCostPerDate = charts.reduce(
        (acc, curr) => {
          const user = project?.users?.find((u) => u.userId === curr.userId);
          const rate = user?.billableRate ?? 0;
          const cost = user?.internalCost ?? 0;
          const hours = secondsToHoursDecimal(curr.duration);
          const date = format(curr.start, "yyyy/MM/dd");

          const existing = acc.find((a) => a.date === date);

          if (existing) {
            existing.revenue += rate * hours;
            existing.cost += cost * hours;
            existing.hours += hours;
          } else {
            acc.push({
              date,
              revenue: rate * hours,
              cost: cost * hours,
              hours,
            });
          }

          return acc;
        },
        [] as { date: string; revenue: number; cost: number; hours: number }[],
      );

      const withEmptyDates = Array.from({ length: difference + 1 }, (_, i) => {
        const date = format(addDays(new Date(input.start), i + 1), "yyyy/MM/dd");
        return {
          date,
          revenue: 0,
          cost: 0,
          hours: 0,
        };
      });

      const finalChart = withEmptyDates.map((entry) => {
        const existing = revenueAndCostPerDate.find((a) => a.date === entry.date);
        const formattedDate = format(entry.date, "PP");

        if (existing) {
          return { ...existing, date: formattedDate };
        }

        return { ...entry, date: formattedDate };
      });
      const arrayT2 = performance.now();

      return {
        grossRevenue: totalRevenue - totalCost,
        revenue: totalRevenue,
        cost: totalCost,
        charts: finalChart,
        arrayT: arrayT2 - arrayT1,
        projectEndsAt: project.endsAt,
        projectStartsAt: project.startsAt,
        raw: charts,
      };
    }),

  getHoursCharts: protectedProcedure
    .input((i) =>
      parse(
        object({
          projectShareableId: string(),
          start: string(),
          end: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const difference = differenceInDays(new Date(input.end), new Date(input.start));
      const [charts, project] = await ctx.db.transaction(async (trx) => {
        const project = await trx.query.projects.findFirst({
          where: (t, { eq }) => eq(t.shareableUrl, input.projectShareableId),
          with: {
            users: {
              with: {
                user: true,
              },
            },
          },
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
              gte(t.start, new Date(input.start)),
              lte(t.start, adjustedEndDate(input.end)),
            );
          },
        });

        return [data, project];
      });

      const groupedByDate = charts.reduce(
        (acc, curr) => {
          const date = format(curr.start, "yyyy/MM/dd");
          const existing = acc.find((a) => a.date === date);

          if (existing) {
            existing.duration += curr.duration;
          } else {
            acc.push({
              date,
              duration: curr.duration,
            });
          }

          return acc;
        },
        [] as { date: string; duration: number }[],
      );

      const totalHoursByUser = charts.reduce(
        (acc, curr) => {
          const user = project.users.find((u) => u.userId === curr.userId);
          const hours = curr.duration;
          const existing = acc.find((a) => a.userId === user?.userId);

          if (existing) {
            existing.hours += hours;
          } else if (user) {
            acc.push({
              userId: user.userId,
              userName: user.user.name ?? "Unknown",
              hours,
            });
          }

          return acc;
        },
        [] as { userId: string; hours: number; userName: string }[],
      );

      const withEmptyDates = Array.from({ length: difference + 1 }, (_, i) => {
        const date = format(addDays(new Date(input.start), i + 1), "yyyy/MM/dd");
        return {
          date,
          duration: 0,
        };
      });

      const finalChart = withEmptyDates.map((entry) => {
        const existing = groupedByDate.find((a) => a.date === entry.date);
        const formattedDate = format(entry.date, "PP");

        if (existing) {
          return { ...existing, date: formattedDate };
        }

        return { ...entry, date: formattedDate };
      });

      const totalNonBillableHours = charts.reduce((acc, curr) => {
        const hours = curr.duration;
        if (curr.billable === false) {
          return acc + hours;
        }
        return acc;
      }, 0);

      const totalHours = charts.reduce((acc, curr) => {
        return acc + curr.duration;
      }, 0);

      return {
        charts: finalChart,
        totalHoursByUser,
        nonBillableHours: totalNonBillableHours,
        totalHours,
      };
    }),

  getBudgetRemaining: protectedProcedure
    .input((i) =>
      parse(
        object({
          projectShareableId: string(),
          from: string(),
          to: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const monthStart = startOfMonth(new Date(input.from));
      const monthEnd = endOfMonth(new Date(input.to));

      const [project, timeEntries] = await ctx.db.transaction(async (trx) => {
        const project = await trx.query.projects.findFirst({
          where: (t, { eq }) => eq(t.shareableUrl, input.projectShareableId),
          with: {
            users: {
              with: {
                user: true,
              },
            },
          },
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
              gte(t.start, monthStart),
              lte(t.start, monthEnd),
            );
          },
        });

        return [project, data];
      });

      const totalHours = timeEntries.reduce((acc, curr) => {
        return acc + curr.duration;
      }, 0);

      const totalBudget = (project.budgetHours ?? 0) * 3600;

      return {
        remaining: totalBudget ? totalBudget - totalHours : 0,
        totalBudget,
        totalHours,
      };
    }),
});
