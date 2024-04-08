import { and } from "drizzle-orm";
import { cookies } from "next/headers";
import { omit, parse } from "valibot";
import { number, object, string } from "zod";
import { RECENT_W_ID_KEY } from "~/lib/constants";
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

      /** I want to think this is safe because we're only dealing with one single user entries */
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

      const workspaceId = Number(cookies().get(RECENT_W_ID_KEY)?.value);

      const entry = await ctx.db.query.timeEntries.findFirst({
        where: (t, op) =>
          op.and(
            op.eq(t.id, input.id!),
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, workspaceId),
          ),
      });

      if (!entry) {
        return {
          error: true,
          message: "Entry not found",
        };
      }

      const updatedEntry = await ctx.db.update(timeEntries).set(input).returning();

      return updatedEntry;
    }),
});
