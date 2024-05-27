import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { object, parse, string } from "valibot";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { clients, clientsSchema } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";

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
  create: protectedProcedure
    .input((i) => parse(clientsSchema, i))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

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
    .input((i) =>
      parse(
        object({
          shareableId: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

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

  update: protectedProcedure
    .input((i) => parse(clientsSchema, i))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

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
