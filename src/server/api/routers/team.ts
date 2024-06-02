import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const teamsRouter = createTRPCRouter({
  getByWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

    if (!workspaceId) {
      return notFound();
    }

    return ctx.db.query.usersOnWorkspaces.findMany({
      where: (t, op) => op.eq(t.workspaceId, Number(workspaceId)),
      with: {
        user: true,
      },
    });
  }),
});
