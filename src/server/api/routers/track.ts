import { TRPCError } from "@trpc/server";
import { formatDate } from "date-fns";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { number, object, omit, parse } from "valibot";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { timeEntries, timeEntrySchema, timeEntrySelect } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const autoTrackerSchema = omit(timeEntrySchema, ["duration", "end"]);
export const manualTrackerSchema = timeEntrySchema;

export const trackerRouter = createTRPCRouter({
  start: protectedProcedure
    .input((i) => parse(autoTrackerSchema, i))
    .mutation(({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const {
        session: { user },
      } = ctx;

      return ctx.db
        .insert(timeEntries)
        .values({
          ...input,
          duration: -1,
          start: new Date(),
          end: null,
          userId: user.id,
          workspaceId: Number(workspaceId),
        })
        .returning();
    }),

  manual: protectedProcedure
    .input((i) => parse(manualTrackerSchema, i))
    .mutation(({ ctx, input }) => {
      const {
        session: { user },
      } = ctx;

      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      if (!input.start || !input.end) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start and end date are required",
        });
      }

      return ctx.db
        .insert(timeEntries)
        .values({
          ...input,
          userId: user.id,
          duration: Number(input.duration),
          start: new Date(input.start),
          end: new Date(input.end),
          monthDate: formatDate(new Date(input.start), "yyyy/MM"),
          trackedAt: formatDate(new Date(), "yyyy/MM/dd"),
          workspaceId: Number(workspaceId),
        })
        .returning();
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

  delete: protectedProcedure
    .input((i) => parse(object({ id: number() }), i))
    .mutation(async ({ ctx, input }) => {
      const deletedEntry = await ctx.db
        .delete(timeEntries)
        .where(and(eq(timeEntries.id, input.id), eq(timeEntries.userId, ctx.session.user.id)))
        .returning();

      return deletedEntry;
    }),
});
