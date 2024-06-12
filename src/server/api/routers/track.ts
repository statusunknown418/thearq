import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { type Integration } from "~/lib/constants";
import { dateToMonthDate } from "~/lib/dates";
import { timeEntries, timeEntrySchema, timeEntrySelect } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getRecentWorkspace } from "./viewer";

export const autoTrackerSchema = timeEntrySchema.omit({
  duration: true,
  end: true,
});

export const manualTrackerSchema = timeEntrySchema.refine((input) => {
  if (input.start && input.end) {
    return input.start < input.end;
  }

  return true;
}, "The end date must be after the start date");

export const trackerRouter = createTRPCRouter({
  start: protectedProcedure.input(autoTrackerSchema).mutation(async ({ ctx, input }) => {
    const workspaceId = await getRecentWorkspace(ctx.session.user.id);
    const integrationProvider = input.integrationProvider as Integration | null;

    if (!workspaceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected",
      });
    }

    const {
      session: { user },
    } = ctx;

    const existingEntry = await ctx.db.query.timeEntries.findFirst({
      where: (t, { and, eq, isNull }) => {
        return and(
          eq(t.userId, user.id),
          eq(t.workspaceId, Number(workspaceId)),
          eq(t.duration, -1),
          isNull(t.end),
        );
      },
    });

    if (existingEntry) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You already have a live entry going on",
      });
    }

    const [entry] = await ctx.db
      .insert(timeEntries)
      .values({
        ...input,
        duration: -1,
        start: new Date(),
        end: null,
        userId: user.id,
        integrationProvider,
        workspaceId: Number(workspaceId),
      })
      .returning();

    return entry;
  }),

  stop: protectedProcedure
    .input(z.object({ id: z.number(), end: z.date(), duration: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await getRecentWorkspace(ctx.session.user.id);

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const {
        session: { user },
      } = ctx;

      const [entry] = await ctx.db
        .update(timeEntries)
        .set({
          end: input.end,
          duration: input.duration,
        })
        .where(
          and(
            eq(timeEntries.userId, user.id),
            eq(timeEntries.workspaceId, Number(workspaceId)),
            eq(timeEntries.duration, -1),
            isNull(timeEntries.end),
          ),
        )
        .returning();

      return entry;
    }),

  manual: protectedProcedure.input(manualTrackerSchema).mutation(async ({ ctx, input }) => {
    const {
      session: { user },
    } = ctx;

    const integrationProvider = input.integrationProvider as Integration | null;
    const workspaceId = await getRecentWorkspace(user.id);

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
        integrationProvider,
        userId: user.id,
        duration: Number(input.duration),
        start: new Date(input.start),
        end: new Date(input.end),
        monthDate: dateToMonthDate(new Date(input.start)),
        workspaceId: Number(workspaceId),
      })
      .returning();
  }),
  update: protectedProcedure.input(timeEntrySelect).mutation(async ({ ctx, input }) => {
    if (!input.id) {
      return {
        error: true,
        message: "No id provided",
      };
    }

    const integrationProvider = input.integrationProvider as Integration | null;

    const updatedEntry = await ctx.db
      .update(timeEntries)
      .set({
        ...input,
        integrationProvider,
      })
      .where(eq(timeEntries.id, input.id))
      .returning();

    return updatedEntry;
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const deletedEntry = await ctx.db
        .delete(timeEntries)
        .where(and(eq(timeEntries.id, input.id), eq(timeEntries.userId, ctx.session.user.id)))
        .returning();

      return deletedEntry;
    }),
});
