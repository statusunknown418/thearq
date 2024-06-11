import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import slugify from "slugify";
import { number, object, parse, string } from "valibot";
import {
  RECENT_WORKSPACE_KEY,
  RECENT_W_ID_KEY,
  createWorkspaceInviteLink,
  getRecentWorkspaceRedisKey,
} from "~/lib/constants";
import { adminPermissions, parsePermissions } from "~/lib/stores/auth-store";
import {
  createWorkspaceSchema,
  users,
  usersOnWorkspaces,
  usersOnWorkspacesSchema,
  workspaceInvitations,
  workspaces,
} from "~/server/db/edge-schema";
import { redis } from "~/server/upstash";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { getRecentWorkspace } from "./viewer";

export const workspacesRouter = createTRPCRouter({
  new: protectedProcedure
    .input((i) => parse(createWorkspaceSchema, i))
    .mutation(async ({ ctx, input }) => {
      try {
        const slug = slugify(input.slug, { lower: true });
        const inviteId = createId();
        const image =
          input.image.length > 0
            ? input.image
            : `https://api.dicebear.com/7.x/initials/svg?seed=${input.name}`;

        const [w] = await ctx.db
          .insert(workspaces)
          .values({
            name: input.name,
            createdById: ctx.session.user.id,
            inviteLink: createWorkspaceInviteLink(slug, inviteId),
            slug,
            image,
          })
          .returning()
          .execute();

        if (!w?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create relation",
          });
        }

        await ctx.db.insert(usersOnWorkspaces).values({
          workspaceId: w.id,
          active: true,
          allowedToSeeDetails: true,
          userId: ctx.session.user.id,
          role: "admin",
          permissions: JSON.stringify(adminPermissions),
          /**
           * @description Only valid when the user is the one creating a workspace
           * member invitations rely on permissions/role and will NOT be owners
           */
          owner: true,
        });

        if (!w) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workspace",
          });
        }

        return {
          success: true,
          workspace: w,
          role: "admin",
          permissions: adminPermissions,
        };
      } catch (e) {
        throw e;
      }
    }),
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.usersOnWorkspaces.findMany({
      where: (t, op) => op.eq(t.userId, ctx.session.user.id),
      with: {
        workspace: true,
      },
    });
  }),
  getBySlug: protectedProcedure
    .input((i) =>
      parse(
        object({
          slug: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const workspaceId = await getRecentWorkspace(ctx.session.user.id);

      if (!workspaceId) {
        return {
          success: false,
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "No workspace found",
          },
        };
      }

      const [workspace, viewer] = await Promise.all([
        ctx.db.query.workspaces.findFirst({
          where: (t, op) => op.eq(t.slug, input.slug),
        }),
        ctx.db.query.usersOnWorkspaces.findFirst({
          where: (t, op) =>
            op.and(op.eq(t.userId, ctx.session.user.id), op.eq(t.workspaceId, Number(workspaceId))),
        }),
      ]);

      if (!workspace) {
        return notFound();
      }

      if (!viewer?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        });
      }

      return {
        success: true,
        error: null,
        data: {
          ...workspace,
          viewerPermissions: parsePermissions(viewer.permissions),
        },
      };
    }),
  getPermissions: protectedProcedure
    .input((i) =>
      parse(
        object({
          slug: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx }) => {
      const workspace = await ctx.db.query.users.findFirst({
        where: (t, op) => op.eq(t.id, ctx.session.user.id),
        columns: {
          recentWId: true,
        },
      });

      if (!workspace) {
        return notFound();
      }

      const viewer = await ctx.db.query.usersOnWorkspaces.findFirst({
        where: (t, op) => {
          return op.and(
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, Number(workspace.recentWId)),
          );
        },
        columns: {
          userId: true,
          permissions: true,
          role: true,
        },
      });

      if (!viewer?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        });
      }

      return {
        ...viewer,
        permissions: parsePermissions(viewer.permissions),
      };
    }),
  setRecent: protectedProcedure
    .input((i) =>
      parse(
        object({
          workspaceSlug: string(),
          workspaceId: number(),
        }),
        i,
      ),
    )
    .mutation(async ({ input, ctx }) => {
      const cookiesStore = cookies();

      cookiesStore.set(RECENT_WORKSPACE_KEY, input.workspaceSlug, {
        path: "/",
        sameSite: "lax",
      });

      cookiesStore.set(RECENT_W_ID_KEY, input.workspaceId.toString(), {
        path: "/",
        sameSite: "lax",
      });

      await redis.set(
        getRecentWorkspaceRedisKey(ctx.session.user.id),
        input.workspaceId.toString(),
      );

      return {
        success: true,
      };
    }),
  rotateInviteLink: protectedProcedure
    .input((i) =>
      parse(
        object({
          workspaceSlug: string(),
        }),
        i,
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: (t, op) =>
          op.and(op.eq(t.slug, input.workspaceSlug), op.eq(t.createdById, ctx.session.user.id)),
      });

      if (!workspace) {
        return {
          error: {
            success: false,
            inviteLink: null,
            code: "NOT_FOUND",
            message: "Workspace not found or not yours 🤔",
          },
        };
      }

      const inviteId = createId();
      const newLink = createWorkspaceInviteLink(input.workspaceSlug, inviteId);

      await ctx.db
        .update(workspaces)
        .set({
          inviteLink: newLink,
        })
        .where(eq(workspaces.id, workspace.id));

      return {
        success: true,
        inviteLink: newLink,
      };
    }),
  acceptInvitation: protectedProcedure
    .input((i) =>
      parse(
        object({
          userEmail: string(),
          workspaceSlug: string(),
        }),
        i,
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: (t, op) => op.eq(t.slug, input.workspaceSlug),
      });

      if (!workspace) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Workspace not found",
          },
        };
      }

      if (workspace.seatCount >= workspace.seatLimit) {
        return {
          success: false,
          data: null,
          error: {
            code: "CONFLICT",
            message: "Workspace is full",
          },
        };
      }

      const [newMember] = await ctx.db
        .insert(usersOnWorkspaces)
        .values({
          role: "member",
          userId: ctx.session.user.id,
          workspaceId: workspace.id,
        })
        .returning({
          newMember: usersOnWorkspaces.userId,
          role: usersOnWorkspaces.role,
          workspaceId: usersOnWorkspaces.workspaceId,
        });

      if (!newMember) {
        return {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Failed to join workspace",
          },
        };
      }

      await Promise.all([
        ctx.db
          .update(workspaces)
          .set({
            seatCount: workspace.seatCount + 1,
          })
          .where(eq(workspaces.id, workspace.id)),
        ctx.db
          .delete(workspaceInvitations)
          .where(
            and(
              eq(workspaceInvitations.workspaceId, workspace.id),
              eq(workspaceInvitations.email, input.userEmail),
            ),
          ),
        ctx.db
          .update(users)
          .set({ recentWId: workspace.id })
          .where(eq(users.id, ctx.session.user.id)),
      ]);

      cookies().set(RECENT_WORKSPACE_KEY, workspace.slug, {
        path: "/",
        sameSite: "lax",
      });

      cookies().set(RECENT_W_ID_KEY, workspace.id.toString(), {
        path: "/",
        sameSite: "lax",
      });

      return {
        success: true,
        data: newMember,
        error: null,
      };
    }),
  getInvitationDetails: publicProcedure
    .input((i) =>
      parse(
        object({
          link: string(),
        }),
        i,
      ),
    )
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.query.workspaces.findFirst({
        where: (t, op) => op.and(op.eq(t.inviteLink, input.link)),
        columns: {
          id: true,
          image: true,
          name: true,
          seatCount: true,
        },
      });

      if (!invite) {
        return {
          data: null,
          error: `Invitation not found, please contact your administrator 
          or the person who invited you.`,
        };
      }

      return {
        data: invite,
      };
    }),

  updateMemberDetails: protectedProcedure
    .input((i) => parse(usersOnWorkspacesSchema, i))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await getRecentWorkspace(ctx.session.user.id);

      if (!workspaceId) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "No workspace selected",
        });
      }

      const relation = await ctx.db.query.usersOnWorkspaces.findFirst({
        where: (t, op) => {
          return op.and(
            op.eq(t.userId, ctx.session.user.id),
            op.eq(t.workspaceId, Number(workspaceId)),
          );
        },
        columns: {
          role: true,
        },
      });

      if (!relation || relation.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to perform this action",
        });
      }

      return ctx.db
        .update(usersOnWorkspaces)
        .set(input)
        .where(
          and(
            eq(usersOnWorkspaces.userId, input.userId),
            eq(usersOnWorkspaces.workspaceId, input.workspaceId),
          ),
        );
    }),
});
