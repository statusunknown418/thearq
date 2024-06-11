import { TRPCError } from "@trpc/server";
import { addDays, differenceInDays, endOfMonth, startOfMonth } from "date-fns";
import { format } from "date-fns-tz";
import { number, object, parse, string } from "valibot";
import { adjustEndDate as adjustedEndDate, secondsToHoursDecimal } from "~/lib/dates";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { getRecentWorkspace } from "../viewer";

export const chartsRouter = createTRPCRouter({
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
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const difference = differenceInDays(new Date(input.end), new Date(input.start));

      const project = await ctx.db.query.projects.findFirst({
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
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }

      const charts = await ctx.db.query.timeEntries.findMany({
        where: (t, { eq, and, gte, lte }) => {
          return and(
            eq(t.workspaceId, Number(wId)),
            eq(t.projectId, project.id),
            gte(t.start, new Date(input.start)),
            lte(t.start, adjustedEndDate(input.end)),
          );
        },
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
        const date = format(addDays(new Date(input.start), i), "yyyy/MM/dd");
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

      const groupedByUser = charts.reduce(
        (acc, curr) => {
          const user = project?.users?.find((u) => u.userId === curr.userId);
          const rate = user?.billableRate ?? 0;
          const cost = user?.internalCost ?? 0;
          const hours = secondsToHoursDecimal(curr.duration);
          const existing = acc.find((a) => a.userId === user?.userId);

          if (existing) {
            existing.revenue += rate * hours;
            existing.cost += cost * hours;
            existing.hours += hours;
          } else if (user) {
            acc.push({
              userId: user.userId,
              userName: user.user.name ?? "Unknown",
              revenue: rate * hours,
              cost: cost * hours,
              hours,
            });
          }

          return acc;
        },
        [] as { userId: string; revenue: number; cost: number; hours: number; userName: string }[],
      );

      return {
        grossRevenue: totalRevenue - totalCost,
        revenue: totalRevenue,
        cost: totalCost,
        charts: finalChart,
        projectEndsAt: project.endsAt,
        projectStartsAt: project.startsAt,
        groupedByUser,
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
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const difference = differenceInDays(new Date(input.end), new Date(input.start));

      const project = await ctx.db.query.projects.findFirst({
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
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }

      const charts = await ctx.db.query.timeEntries.findMany({
        where: (t, { eq, and, gte, lte }) => {
          return and(
            eq(t.workspaceId, Number(wId)),
            eq(t.projectId, project.id),
            gte(t.start, new Date(input.start)),
            lte(t.start, adjustedEndDate(input.end)),
          );
        },
      });

      const groupedByDate = charts.reduce(
        (acc, curr) => {
          const date = format(curr.start, "yyyy/MM/dd");
          const existing = acc.find((a) => a.date === date);

          if (existing) {
            existing.Duration += curr.billable === true ? curr.duration : 0;
            existing["Non-Billable"] += curr.billable === false ? curr.duration : 0;
          } else {
            acc.push({
              date,
              Duration: curr.billable === true ? curr.duration : 0,
              "Non-Billable": curr.billable === false ? curr.duration : 0,
            });
          }

          return acc;
        },
        [] as { date: string; Duration: number; "Non-Billable": number }[],
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
        const date = format(addDays(new Date(input.start), i), "yyyy/MM/dd");
        return {
          date,
          Duration: 0,
          "Non-Billable": 0,
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
      const wId = await getRecentWorkspace(ctx.session.user.id);

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

      const totalBudget = project.budgetHours ?? 0;

      return {
        remaining: totalBudget ? totalBudget - totalHours / 3600 : 0,
        totalBudget,
        totalHours,
      };
    }),
  getPersonCharts: protectedProcedure
    .input((i) =>
      parse(
        object({
          projectId: number(),
          userId: string(),
          start: string(),
          end: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const [project, charts] = await Promise.all([
        ctx.db.query.projects.findFirst({
          where: (t, { eq }) => eq(t.id, input.projectId),
          with: {
            users: {
              with: {
                user: true,
              },
            },
          },
        }),

        ctx.db.query.timeEntries.findMany({
          where: (t, { eq, and, gte, lte }) => {
            return and(
              eq(t.workspaceId, Number(wId)),
              eq(t.projectId, input.projectId),
              eq(t.userId, input.userId),
              gte(t.start, new Date(input.start)),
              lte(t.start, adjustedEndDate(input.end)),
            );
          },
        }),
      ]);

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

      const totalBillableHours = charts.reduce((acc, curr) => {
        const hours = curr.duration;
        if (curr.billable === true) {
          return acc + hours;
        }
        return acc;
      }, 0);

      const totalNonBillableHours = charts.reduce((acc, curr) => {
        const hours = curr.duration;
        if (curr.billable === false) {
          return acc + hours;
        }
        return acc;
      }, 0);

      return {
        totalRevenue,
        totalCost,
        totalBillableHours,
        totalNonBillableHours,
      };
    }),
});
