import { TRPCError } from "@trpc/server";
import { startOfDay } from "date-fns";
import { and } from "drizzle-orm";
import { number, object, string, z } from "zod";
import { LIVE_ENTRY_DURATION } from "~/lib/constants";
import { adjustEndDate, computeDuration, secondsToHoursDecimal } from "~/lib/dates";
import { type TimeEntry } from "~/server/db/edge-schema";
import { type RouterOutputs } from "~/trpc/shared";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getRecentWorkspace } from "./viewer";

export type CustomEvent = RouterOutputs["entries"]["getByMonth"][number] & {
  temp?: boolean;
};

export const entriesRouter = createTRPCRouter({
  getNonInvoiced: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.number()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        selection: z.enum(["all", "range", "none"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (input.selection === "none" || input.projectIds?.length === 0 || !wId) {
        return [];
      }

      const entries = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.workspaceId, Number(wId)),
            op.isNull(t.invoiceId),
            !!input.projectIds ? op.inArray(t.projectId, input.projectIds) : undefined,
            !!input.startDate ? op.gte(t.start, new Date(input.startDate)) : undefined,
            !!input.endDate ? op.lte(t.start, new Date(input.endDate)) : undefined,
          ),
        with: {
          project: {
            columns: {
              id: true,
              color: true,
              name: true,
              identifier: true,
            },
            with: {
              users: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
      });

      /* TODO: NOTE: I think that for this it's ok to manage the grouping in the client-side */
      return entries;
    }),
  getByMonth: protectedProcedure
    .input(
      object({
        projectId: number().optional(),
        monthDate: string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace found",
        });
      }

      /**
       * TODO: Make this a prepared statement
       */
      const weekEntries = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, wId),
            op.eq(t.monthDate, input.monthDate),
            input.projectId ? op.eq(t.projectId, input.projectId) : undefined,
          ),
        with: {
          project: {
            columns: {
              id: true,
              color: true,
              name: true,
              identifier: true,
            },
          },
          user: true,
        },
      });

      /** I want to think this is performance-safe because we're only dealing with one single user entries */
      return weekEntries.sort((a, b) => a.start.getTime() - b.start.getTime());
    }),
  getSummary: protectedProcedure
    .input(
      object({
        monthDate: string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace found",
        });
      }

      const summary = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, wId),
            op.eq(t.monthDate, input.monthDate),
          ),
        with: {
          project: {
            columns: {
              id: true,
              color: true,
              name: true,
              identifier: true,
            },
          },
          user: true,
        },
      });

      const total = summary.reduce((acc, entry) => {
        acc += entry.duration;
        return acc;
      }, 0);

      /**
       * TODO: Check for potential performance issues when we scale to
       * more users
       */
      const hoursByDay = summary.reduce(
        (acc, entry) => {
          const date = entry.start.getDate();
          const duration = computeDuration(entry);

          if (!acc[date]) {
            acc[date] = 0;
          }

          acc[date] += duration;
          return acc;
        },
        {} as Record<number, number>,
      );

      const entriesByDate = summary.reduce(
        (acc, entry) => {
          const date = entry.start.getDate();

          if (!acc[date]) {
            acc[date] = [];
          }

          acc[date]?.push(entry);
          return acc;
        },
        {} as Record<number, (TimeEntry & { project: { name: string } | null })[]>,
      );

      return {
        total,
        hoursByDay,
        entriesByDate,
      };
    }),
  getLiveEntry: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await getRecentWorkspace(ctx.session.user.id);

    if (!workspaceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected",
      });
    }

    const entry = await ctx.db.query.timeEntries.findFirst({
      where: (t, op) =>
        and(
          op.eq(t.userId, ctx.session.user.id),
          op.eq(t.workspaceId, Number(workspaceId)),
          op.eq(t.duration, LIVE_ENTRY_DURATION),
          op.isNull(t.end),
        ),
      with: {
        project: {
          columns: {
            color: true,
            name: true,
            identifier: true,
          },
        },
        user: true,
      },
    });

    if (entry) {
      return entry;
    }

    return null;
  }),

  getTotals: protectedProcedure
    .input(
      object({
        from: string(),
        to: string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        return null;
      }

      const summary = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.workspaceId, Number(wId)),
            op.gte(t.start, new Date(input.from)),
            op.lte(t.end, adjustEndDate(input.to)),
          ),
        with: {
          project: {
            columns: {
              color: true,
              name: true,
              identifier: true,
              id: true,
            },
            with: {
              users: true,
              client: true,
            },
          },
          workspace: {
            with: {
              users: true,
            },
          },
        },
      });

      const totalTime = summary.reduce((acc, entry) => {
        acc += entry.duration;
        return acc;
      }, 0);

      const nonBillableTime = summary.reduce((acc, entry) => {
        if (!entry.billable) {
          acc += entry.duration;
        }

        return acc;
      }, 0);

      const totalEarnings = summary.reduce((acc, entry) => {
        const user = entry.workspace.users.find((u) => u.userId === entry.userId);

        if (!user) {
          return acc;
        }

        if (!acc) {
          acc = 0;
        }

        if (!!entry.projectId && !!entry.project) {
          const projectUser = entry.project?.users.find((u) => u.userId === entry.userId);

          acc += secondsToHoursDecimal(entry.duration) * (projectUser?.billableRate ?? 1);
          return acc;
        }

        acc += secondsToHoursDecimal(entry.duration) * user.defaultBillableRate;
        return acc;
      }, 0);

      const totalInternalCost = summary.reduce((acc, entry) => {
        const user = entry.workspace.users.find((u) => u.userId === entry.userId);

        if (!user) {
          return acc;
        }

        if (!acc) {
          acc = 0;
        }

        if (!!entry.projectId && !!entry.project) {
          const projectUser = entry.project?.users.find((u) => u.userId === entry.userId);

          acc += secondsToHoursDecimal(entry.duration) * (projectUser?.internalCost ?? 0);
          return acc;
        }

        acc += secondsToHoursDecimal(entry.duration) * user.defaultInternalCost;
        return acc;
      }, 0);

      const groupedByProject = summary.reduce(
        (acc, entry) => {
          const project = entry.project;

          if (!project) {
            return acc;
          }

          if (!acc[project.id]) {
            acc[project.id] = {
              duration: 0,
              project: project.name,
              client: project.client?.name,
              color: project.color,
            };
          }

          acc[project.id]!.duration += entry.duration;

          return acc;
        },
        {} as Record<
          number,
          {
            duration: number;
            project: string;
            client?: string;
            color: string;
          }
        >,
      );

      return {
        totalTime,
        totalEarnings,
        totalInternalCost,
        summary,
        nonBillableTime,
        groupedByProject: Object.entries(groupedByProject)
          .map(([id, value]) => ({
            id: id,
            ...value,
          }))
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 3),
      };
    }),
});

interface DurationData {
  totalDurationForDay: number;
  percentageCompared: number;
}

/**
 * @todo maybe implement this on the Analytics page?
 * @param entries
 * @returns
 */
function _processTimeEntries(entries: TimeEntry[]): Record<number, DurationData> {
  // Object to store results by date
  const results: Record<number, DurationData> = {};
  const dailyDurations: Record<number, number> = {};

  // Process each entry
  entries.forEach((entry) => {
    if (!entry.start) {
      return;
    }

    const dayStart = startOfDay(entry.start).getDate();

    if (!results[dayStart]) {
      results[dayStart] = {
        totalDurationForDay: 0,
        percentageCompared: 0, // Initialize but will calculate later
      };
    }

    results[dayStart]!.totalDurationForDay += entry.duration;
    dailyDurations[dayStart] = results[dayStart]!.totalDurationForDay;
  });

  // Calculate percentage changes in a separate loop
  const sortedDays = Object.keys(dailyDurations).map(Number).sort();
  sortedDays.forEach((day, index) => {
    if (index > 0) {
      const currentDuration = dailyDurations[day];
      const selectIdx = sortedDays[index - 1];

      if (!selectIdx) {
        return;
      }

      const prevDuration = dailyDurations[selectIdx];

      if (!results[day]) {
        results[day] = {
          totalDurationForDay: 0,
          percentageCompared: 0,
        };
      }

      if (!currentDuration || !prevDuration) {
        return;
      }

      results[day]!.percentageCompared = ((currentDuration - prevDuration) / prevDuration) * 100;
    }
  });

  return results;
}
