import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { number, object, parse } from "valibot";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { adminPermissions, parsePermissions, type UserPermissions } from "~/lib/stores/auth-store";
import { projects, projectsSchema, usersOnProjects } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const hasServer = (perms: UserPermissions, data: string) => {
  const formatted = parsePermissions(data);
  return formatted.includes(perms);
};

export const projectsRouter = createTRPCRouter({
  getDetails: protectedProcedure
    .input((i) => parse(object({ id: number() }), i))
    .query(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "projectId is required",
        });
      }

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const data = await ctx.db.query.usersOnProjects.findFirst({
        where: (t, { eq, and }) =>
          and(eq(t.projectId, input.id), eq(t.userId, ctx.session.user.id)),
        with: {
          project: true,
        },
      });

      if (!data) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to view this project",
        });
      }

      if (data.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to view this project",
        });
      }

      return data;
    }),
  get: protectedProcedure.query(async ({ ctx }) => {
    const wId = cookies().get(RECENT_W_ID_KEY)?.value;

    if (!wId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected try navigating to another workspace.",
      });
    }

    const data = await ctx.db.query.projects.findMany({
      where: (t, { eq }) => eq(t.workspaceId, Number(wId)),
    });

    return data;
  }),

  create: protectedProcedure
    .input((i) => parse(projectsSchema, i))
    .mutation(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const data = await ctx.db.transaction(async (trx) => {
        const selectedWorkspace = await trx.query.usersOnWorkspaces.findFirst({
          where: (t, { eq }) => eq(t.workspaceId, Number(wId)),
        });

        const [project] = await trx
          .insert(projects)
          .values({
            ...input,
            workspaceId: Number(wId),
          })
          .returning();

        if (!project) {
          trx.rollback();
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed when creating a project",
          });
        }

        await trx.insert(usersOnProjects).values({
          projectId: project.id,
          userId: ctx.session.user.id,
          workspaceId: Number(wId),
          role: "admin",
          permissions: JSON.stringify(adminPermissions),
          billableRate: selectedWorkspace?.defaultBillableRate,
          weekCapacity: selectedWorkspace?.defaultWeekCapacity,
        });

        return project;
      });

      return data;
    }),
  edit: protectedProcedure
    .input((i) => parse(projectsSchema, i))
    .mutation(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "projectId is required",
        });
      }

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const data = await ctx.db.transaction(async (trx) => {
        const allowed = await trx.query.usersOnProjects.findFirst({
          where: (t, { eq, and }) =>
            and(eq(t.projectId, input.id!), eq(t.userId, ctx.session.user.id)),
        });

        if (!allowed?.userId) {
          trx.rollback();
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not allowed to edit this project",
          });
        }

        return await ctx.db.update(projects).set(input).where(eq(projects.id, input.id!));
      });

      return data;
    }),
  delete: protectedProcedure
    .input((i) => parse(object({ id: number() }), i))
    .mutation(async ({ ctx, input }) => {
      const wId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "projectId is required",
        });
      }

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const data = await ctx.db.delete(projects).where(eq(projects.id, input.id));

      return data;
    }),
});
