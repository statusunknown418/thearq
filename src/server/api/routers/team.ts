import { notFound } from "next/navigation";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const teamsRouter = createTRPCRouter({
  getByWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const w = await ctx.db.query.users.findFirst({
      where: (t, op) => op.eq(t.id, ctx.session.user.id),
    });

    if (!w?.recentWId) {
      return notFound();
    }

    return ctx.db.query.usersOnWorkspaces.findMany({
      where: (t, op) => op.eq(t.workspaceId, Number(w.recentWId)),
      with: {
        user: true,
      },
    });
  }),
});
