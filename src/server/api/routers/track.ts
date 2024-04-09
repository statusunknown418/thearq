import { TRPCError } from "@trpc/server";
import { formatDate } from "date-fns";
import { cookies } from "next/headers";
import { omit, parse } from "valibot";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { timeEntries, timeEntrySchema } from "~/server/db/edge-schema";
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

      if (!input.workspaceId) {
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
        })
        .returning();
    }),
});
