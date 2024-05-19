import { array, number, object, parse } from "valibot";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const projectsInvoicingRouter = createTRPCRouter({
  getTotals: protectedProcedure
    .input((i) =>
      parse(
        object({
          ids: array(number()),
        }),
        i,
      ),
    )
    .query(async ({ input, ctx }) => {
      return;
    }),
});
