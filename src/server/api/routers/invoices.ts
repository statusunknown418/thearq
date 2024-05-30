import { object, string } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { TRPCError } from "@trpc/server";
import { parse } from "valibot";
import { invoices, invoicesSchema } from "~/server/db/edge-schema";

export const invoicesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      object({
        from: string(),
        to: string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const wId = cookies().get(RECENT_W_ID_KEY);

      if (!wId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No workspace selected",
        });
      }

      const invoices = await ctx.db.query.invoices.findMany({
        where: (t, op) =>
          op.and(
            op.eq(t.workspaceId, Number(wId)),
            op.gte(t.createdAt, new Date(input.from)),
            op.lte(t.createdAt, new Date(input.to)),
          ),
      });

      return invoices;
    }),

  create: protectedProcedure
    .input((i) => parse(invoicesSchema, i))
    .mutation(async ({ input, ctx }) => {
      const wId = cookies().get(RECENT_W_ID_KEY);

      if (!wId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No workspace selected",
        });
      }

      const baseTotal = input.items?.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);

      const computeTotal =
        baseTotal &&
        baseTotal -
          ((input.discountPercentage ?? 0) * baseTotal) / 100 +
          ((input.taxPercentage ?? 0) * baseTotal) / 100;

      const invoice = await ctx.db
        .insert(invoices)
        .values({
          ...input,
          total: computeTotal ?? 0,
          workspaceId: Number(wId),
        })
        .returning();

      return invoice;
    }),
});
