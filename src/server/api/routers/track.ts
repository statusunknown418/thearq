import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { type Event } from "react-big-calendar";
import { omit, parse } from "valibot";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { timeEntries, timeEntrySchema } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export type CustomEvent = Event & {
  data: {
    integrationUrl?: string;
    projectIdentifier?: string;
    projectColor: string;
    id: number;
  };
};
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
          end: new Date(),
          userId: user.id,
          workspaceId: Number(workspaceId),
        })
        .returning();
    }),

  manual: protectedProcedure
    .input((i) => parse(manualTrackerSchema, i))
    .mutation(({ ctx }) => {
      return;
    }),
});
