import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { parse } from "valibot";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { clients, clientsSchema } from "~/server/db/edge-schema";
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
});
