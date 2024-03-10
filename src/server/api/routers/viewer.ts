import { createTRPCRouter, protectedProcedure } from "../trpc";

export const viewerRouter = createTRPCRouter({
  getIntegrations: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.accounts.findMany({
      where: (t, op) => op.eq(t.userId, ctx.session.user.id),
    });
  }),
});
