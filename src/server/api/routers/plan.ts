import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const plansRouter = createTRPCRouter({
  getPlan: protectedProcedure.query(async ({ ctx }) => {
    const wId = ctx.session.user.recentWId;

    if (!wId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No workspace selected" });
    }

    const plan = ctx.db.query.workspacePlans.findFirst({
      where: (t, op) => op.eq(t.workspaceId, Number(wId)),
    });

    const workspace = ctx.db.query.workspaces.findFirst({
      where: (t, op) => op.eq(t.id, wId),
    });

    return await Promise.all([plan, workspace]);
  }),
});
