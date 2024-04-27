import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { date, minValue, number, object, omit, parse } from "valibot";
import { RECENT_W_ID_KEY, type Integration } from "~/lib/constants";
import { dateToMonthDate } from "~/lib/stores/events-store";
import { timeEntries, timeEntrySchema, timeEntrySelect } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const autoTrackerSchema = omit(timeEntrySchema, ["duration", "end", "workspaceId"]);
export const manualTrackerSchema = omit(timeEntrySchema, ["workspaceId"]);

export const trackerRouter = createTRPCRouter({
  start: protectedProcedure
    .input((i) => parse(autoTrackerSchema, i))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;
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

      const entry = await ctx.db.transaction(async (trx) => {
        const existingEntry = await trx.query.timeEntries.findFirst({
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
          trx.rollback();
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You already have a live entry going on",
          });
        }

        const [entry] = await trx
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
      });

      return entry;
    }),

  stop: protectedProcedure
    .input((i) => parse(object({ id: number(), end: date(), duration: number([minValue(0)]) }), i))
    .mutation(async ({ ctx, input }) => {
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

  manual: protectedProcedure
    .input((i) => parse(manualTrackerSchema, i))
    .mutation(({ ctx, input }) => {
      const {
        session: { user },
      } = ctx;

      const integrationProvider = input.integrationProvider as Integration | null;
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
  update: protectedProcedure
    .input((i) => parse(omit(timeEntrySelect, ["userId", "workspaceId"]), i))
    .mutation(async ({ ctx, input }) => {
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
