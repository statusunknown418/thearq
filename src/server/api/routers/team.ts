import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { object, string } from "zod";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { usersOnWorkspaces } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const teamsRouter = createTRPCRouter({
  getByWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

    if (!workspaceId) {
      return notFound();
    }

    const dataPromise = ctx.db.query.usersOnWorkspaces.findMany({
      where: (t, op) => op.eq(t.workspaceId, Number(workspaceId)),
      with: {
        user: true,
      },
    });

    const viewerPromise = ctx.db.query.usersOnWorkspaces.findFirst({
      where: (t, op) =>
        op.and(op.eq(t.userId, ctx.session.user.id), op.eq(t.workspaceId, Number(workspaceId))),
      with: {
        user: true,
      },
      columns: {
        userId: true,
        permissions: true,
        role: true,
      },
    });

    const [data, viewer] = await Promise.all([dataPromise, viewerPromise]);

    return {
      table: data,
      allowed: viewer?.role === "admin",
    };
  }),

  removeUser: protectedProcedure
    .input(
      object({
        userId: string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;
      const userId = input.userId;

      if (userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove yourself from the team",
        });
      }

      await ctx.db
        .delete(usersOnWorkspaces)
        .where(
          and(eq(usersOnWorkspaces.userId, userId), eq(usersOnWorkspaces.workspaceId, Number(wId))),
        );
    }),
});
