import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workspacesRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.usersOnWorkspaces.findMany({
      where: (t, op) => op.eq(t.userId, ctx.session.user.id),
      with: {
        workspace: true,
      },
    });
  }),
});
