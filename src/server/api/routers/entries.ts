import { and, eq } from "drizzle-orm";
import { omit, parse } from "valibot";
import { number, object, string } from "zod";
import { timeEntries, timeEntrySelect } from "~/server/db/edge-schema";
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
  update: protectedProcedure
    .input((i) => parse(omit(timeEntrySelect, ["userId", "workspaceId"]), i))
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        return {
          error: true,
          message: "No id provided",
        };
      }

      const updatedEntry = await ctx.db
        .update(timeEntries)
        .set(input)
        .where(eq(timeEntries.id, input.id))
        .returning();

      return updatedEntry;
    }),
});
