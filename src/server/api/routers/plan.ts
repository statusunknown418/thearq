import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getRecentWorkspace } from "./viewer";

export const plansRouter = createTRPCRouter({
  getPlan: protectedProcedure.query(async ({ ctx }) => {
    const wId = await getRecentWorkspace(ctx.session.user.id);

    if (!wId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No workspace selected" });
    }

    const plan = ctx.db.query.workspacePlans.findFirst({
      where: (t, op) => op.eq(t.workspaceId, Number(wId)),
    });

    const workspace = ctx.db.query.workspaces.findFirst({
      where: (t, op) => op.eq(t.id, Number(wId)),
    });

    return await Promise.all([plan, workspace]);
  }),
});
