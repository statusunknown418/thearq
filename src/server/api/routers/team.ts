import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { object, string } from "zod";
import { usersOnWorkspaces } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getRecentWorkspace } from "./viewer";

export const teamsRouter = createTRPCRouter({
  getByWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await getRecentWorkspace(ctx.session.user.id);

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
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No workspace selected",
        });
      }

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
