import { getWeek } from "date-fns";
import { and } from "drizzle-orm";
import { date, number, object, string } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const logsHistoryRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      object({
        date: date(),
        workspaceId: number(),
        projectId: number().optional(),
        monthDate: string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = input.date;
      const week = getWeek(input.date ?? now);

      /**
       * TODO: Make this a prepared statement
       */
      const weekEntries = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, input.workspaceId),
            op.eq(t.weekNumber, week),
            // op.eq(t.monthDate, input.monthDate),
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

      /** I want to think this is safe because we're only dealing with one single user entries */
      return weekEntries.sort((a, b) => a.start.getTime() - b.start.getTime());
    }),
});
