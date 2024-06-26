import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import slugify from "slugify";
import { nullable, number, object, parse, string } from "valibot";
import { adminPermissions, memberPermissions } from "~/lib/stores/auth-store";
import { projects, projectsSchema, usersOnProjects, type Roles } from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { getRecentWorkspace } from "../viewer";

export const baseProjectsRouter = createTRPCRouter({
  getDetails: protectedProcedure
    .input((i) => parse(object({ shareableUrl: string() }), i))
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!input.shareableUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "shareableUrl is required",
        });
      }

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const project = await ctx.db.query.projects.findFirst({
        where: (t, { eq }) => eq(t.shareableUrl, input.shareableUrl),
        with: {
          client: true,
          users: {
            where: (t, { eq }) => eq(t.userId, ctx.session.user.id),
            with: {
              user: true,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }

      const data = project.users.find((u) => u.userId === ctx.session.user.id);

      if (!data || data.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to view this project",
        });
      }

      return project;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const wId = await getRecentWorkspace(ctx.session.user.id);

    if (!wId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected try navigating to another workspace.",
      });
    }

    const data = await ctx.db.query.usersOnProjects.findMany({
      where: (t, { eq, and }) =>
        and(eq(t.workspaceId, Number(wId)), eq(t.userId, ctx.session.user.id)),
      with: {
        project: {
          columns: {
            id: true,
            name: true,
            description: true,
            identifier: true,
            color: true,
            budgetHours: true,
            type: true,
            startsAt: true,
            endsAt: true,
            shareableUrl: true,
            budgetResetsPerMonth: true,
          },
          with: {
            client: true,
          },
        },
      },
    });

    return data;
  }),

  create: protectedProcedure.input(projectsSchema).mutation(async ({ ctx, input }) => {
    const wId = await getRecentWorkspace(ctx.session.user.id);

    if (!wId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workspace selected",
      });
    }

    const createdId = createId();
    const prefix = input.identifier ? `${input.identifier}-` : "";
    const shareableUrl = slugify(`${prefix}${createdId}`);

    const selectedWorkspace = await ctx.db.query.usersOnWorkspaces.findFirst({
      where: (t, { eq }) => eq(t.workspaceId, Number(wId)),
      columns: {
        role: true,
        defaultBillableRate: true,
        defaultWeekCapacity: true,
        defaultInternalCost: true,
      },
    });

    if (selectedWorkspace?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to create a project",
      });
    }

    const [project] = await ctx.db
      .insert(projects)
      .values({
        ...input,
        workspaceId: Number(wId),
        ownerId: ctx.session.user.id,
        shareableUrl,
      })
      .returning();

    if (!project) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed when creating a project",
      });
    }

    await ctx.db.insert(usersOnProjects).values({
      projectId: project.id,
      userId: ctx.session.user.id,
      workspaceId: Number(wId),
      role: "admin",
      permissions: JSON.stringify(adminPermissions),
      billableRate: selectedWorkspace?.defaultBillableRate,
      weekCapacity: selectedWorkspace?.defaultWeekCapacity,
      internalCost: selectedWorkspace?.defaultInternalCost,
      fromDefault: true,
    });

    return project;
  }),
  edit: protectedProcedure.input(projectsSchema).mutation(async ({ ctx, input }) => {
    const wId = await getRecentWorkspace(ctx.session.user.id);

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

    const allowed = await ctx.db.query.usersOnProjects.findFirst({
      where: (t, { eq, and }) => and(eq(t.projectId, input.id!), eq(t.userId, ctx.session.user.id)),
    });

    if (allowed?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not allowed to edit this project",
      });
    }

    await ctx.db.update(projects).set(input).where(eq(projects.id, input.id));

    return {
      id: input.id,
      success: true,
    };
  }),
  delete: protectedProcedure
    .input((i) => parse(object({ id: number() }), i))
    .mutation(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

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

  getTeam: protectedProcedure
    .input((i) =>
      parse(
        object({
          projectShareableId: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const project = await ctx.db.query.projects.findFirst({
        where: (t, { eq }) => eq(t.shareableUrl, input.projectShareableId),
        columns: {
          id: true,
          name: true,
          identifier: true,
        },
        with: {
          users: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }

      if (project.users.find((u) => u.userId === ctx.session.user.id)?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to view this project",
        });
      }

      return project;
    }),

  updateMember: protectedProcedure
    .input((i) =>
      parse(
        object({
          projectId: number(),
          userId: string(),
          role: string(),
          billableRate: number(),
          weekCapacity: nullable(number()),
          internalCost: number(),
        }),
        i,
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const allowed = await ctx.db.query.projects.findFirst({
        where: (t, { eq, and }) => {
          return and(eq(t.id, input.projectId), eq(t.ownerId, ctx.session.user.id));
        },
        with: {
          users: true,
        },
      });

      if (!allowed?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (allowed.users.find((u) => u.userId === ctx.session.user.id)?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this project",
        });
      }

      return await ctx.db
        .update(usersOnProjects)
        .set({
          billableRate: input.billableRate,
          weekCapacity: input.weekCapacity,
          internalCost: input.internalCost,
          role: input.role as Roles,
        })
        .where(
          and(eq(usersOnProjects.projectId, allowed.id), eq(usersOnProjects.userId, input.userId)),
        );
    }),

  addUser: protectedProcedure
    .input((i) =>
      parse(
        object({
          userId: string(),
          projectId: number(),
        }),
        i,
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const relationPromise = ctx.db.query.usersOnWorkspaces.findFirst({
        where: (t, { eq, and }) => {
          return and(eq(t.userId, ctx.session.user.id), eq(t.workspaceId, Number(wId)));
        },
        with: {
          user: true,
        },
      });

      const workspaceUserPromise = ctx.db.query.usersOnWorkspaces.findFirst({
        where: (t, { eq, and }) => {
          return and(eq(t.userId, input.userId), eq(t.workspaceId, Number(wId)));
        },
        with: {
          user: true,
        },
      });

      const [relation, workspaceUser] = await Promise.all([relationPromise, workspaceUserPromise]);

      if (!relation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (relation.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this project",
        });
      }

      if (!workspaceUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return ctx.db.insert(usersOnProjects).values({
        projectId: input.projectId,
        userId: input.userId,
        workspaceId: Number(wId),
        role: "member",
        permissions: JSON.stringify(memberPermissions),
        billableRate: workspaceUser.defaultBillableRate,
        internalCost: workspaceUser.defaultInternalCost,
        weekCapacity: workspaceUser.defaultWeekCapacity,
      });
    }),

  removeUser: protectedProcedure
    .input((i) => parse(object({ userId: string(), projectId: number() }), i))

    .mutation(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const allowed = await ctx.db.query.projects.findFirst({
        where: (t, { eq, and }) => {
          return and(eq(t.id, input.projectId), eq(t.ownerId, ctx.session.user.id));
        },
        with: {
          users: true,
        },
      });

      if (!allowed?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (allowed.users.find((u) => u.userId === ctx.session.user.id)?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this project",
        });
      }

      return await ctx.db
        .delete(usersOnProjects)
        .where(
          and(
            eq(usersOnProjects.projectId, input.projectId),
            eq(usersOnProjects.userId, input.userId),
          ),
        );
    }),

  getByClient: protectedProcedure
    .input((i) =>
      parse(
        object({
          clientId: number(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      return ctx.db.query.projects.findMany({
        where: (t, { and, eq }) =>
          and(eq(t.clientId, input.clientId), eq(t.workspaceId, Number(wId))),
      });
    }),
});
