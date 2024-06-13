import { and } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { getRecentWorkspace } from "../viewer";

export const entriesInvoicingRouter = createTRPCRouter({
  getNonInvoiced: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.number()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        selection: z.enum(["all", "range", "none"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (input.selection === "none" || input.projectIds?.length === 0 || !wId) {
        return [];
      }

      const entries = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.workspaceId, Number(wId)),
            op.isNull(t.invoiceId),
            !!input.projectIds ? op.inArray(t.projectId, input.projectIds) : undefined,
            !!input.startDate ? op.gte(t.start, new Date(input.startDate)) : undefined,
            !!input.endDate ? op.lte(t.start, new Date(input.endDate)) : undefined,
          ),
        with: {
          project: {
            columns: {
              id: true,
              color: true,
              name: true,
              identifier: true,
            },
            with: {
              users: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
      });

      /* TODO: NOTE: I think that for this it's ok to manage the grouping in the client-side */
      return entries;
    }),
});
