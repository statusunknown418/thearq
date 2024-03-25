import { getWeek } from "date-fns";
import { and } from "drizzle-orm";
import { date, number, object, optional, parse } from "valibot";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const logsHistorySchema = object({
  date: date(),
  workspaceId: number(),
  projectId: optional(number()),
  weekNumber: optional(number()),
});

export const logsHistoryRouter = createTRPCRouter({
  get: protectedProcedure
    .input((i) => parse(logsHistorySchema, i))
    .query(({ ctx, input }) => {
      const now = input.date;
      const week = getWeek(input.date ?? now);

      /**
       * TODO: Make this a prepared statement
       */
      return ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, input.workspaceId),
            op.eq(t.weekNumber, week),
            input.projectId ? op.eq(t.projectId, input.projectId) : undefined,
          ),
      });
    }),
});
