import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const clientsRouter = createTRPCRouter({
  getByWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

    if (!workspaceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected",
      });
    }

    return ctx.db.query.clients.findMany({
      where: (t, op) => op.eq(t.workspaceId, Number(workspaceId)),
    });
  }),
});
