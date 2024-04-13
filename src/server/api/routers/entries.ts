import { and } from "drizzle-orm";
import { number, object, string } from "zod";
import { computeDuration } from "~/lib/stores/events-store";
import { type RouterOutputs } from "~/trpc/shared";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export type CustomEvent = RouterOutputs["entries"]["getByMonth"][number] & { temp?: boolean };
export const entriesRouter = createTRPCRouter({
  getByMonth: protectedProcedure
    .input(
      object({
        workspaceId: number(),
        projectId: number().optional(),
        monthDate: string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      /**
       * TODO: Make this a prepared statement
       */
      const weekEntries = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, input.workspaceId),
            op.eq(t.monthDate, input.monthDate),
            input.projectId ? op.eq(t.projectId, input.projectId) : undefined,
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

      /** I want to think this is performance-safe because we're only dealing with one single user entries */
      return weekEntries.sort((a, b) => a.start.getTime() - b.start.getTime());
    }),
  getSummary: protectedProcedure
    .input(
      object({
        workspaceId: number(),
        monthDate: string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const summary = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, input.workspaceId),
            op.eq(t.monthDate, input.monthDate),
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

      return {
        total,
        hoursByDay,
      };
    }),
});
