import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { clients, clientsSchema } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getRecentWorkspace } from "./viewer";

export const clientsRouter = createTRPCRouter({
  getByWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await getRecentWorkspace(ctx.session.user.id);

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
  create: protectedProcedure.input(clientsSchema).mutation(async ({ ctx, input }) => {
    const workspaceId = await getRecentWorkspace(ctx.session.user.id);

    if (!workspaceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected",
      });
    }

    const [newClient] = await ctx.db
      .insert(clients)
      .values({
        ...input,
        workspaceId: Number(workspaceId),
      })
      .returning();

    return newClient;
  }),

  getByProject: protectedProcedure
    .input(z.object({ shareableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await getRecentWorkspace(ctx.session.user.id);

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const project = await ctx.db.query.projects.findFirst({
        where: (t, op) =>
          op.and(
            op.eq(t.shareableUrl, input.shareableId),
            op.eq(t.workspaceId, Number(workspaceId)),
          ),
        with: {
          client: true,
        },
      });

      if (!project?.client) {
        return null;
      }

      return project.client;
    }),

  update: protectedProcedure.input(clientsSchema).mutation(async ({ ctx, input }) => {
    const workspaceId = await getRecentWorkspace(ctx.session.user.id);

    if (!workspaceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected",
      });
    }

    if (!input.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Client ID is required",
      });
    }

    const updatedClient = await ctx.db
      .update(clients)
      .set(input)
      .where(and(eq(clients.id, input.id), eq(clients.workspaceId, Number(workspaceId))));

    return updatedClient;
  }),
});
