import { createId } from "@paralleldrive/cuid2";
import { DatabaseError } from "@planetscale/database";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import slugify from "slugify";
import { object, parse, string } from "valibot";
import {
  RECENT_WORKSPACE_KEY,
  USER_WORKSPACE_PERMISSIONS,
  USER_WORKSPACE_ROLE,
  createWorkspaceInviteLink,
} from "~/lib/constants";
import { adminPermissions, parsePermissions } from "~/lib/stores/auth-store";
import {
  createWorkspaceSchema,
  usersOnWorkspaces,
  workspaceInvitations,
  workspaces,
} from "~/server/db/edge-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workspacesRouter = createTRPCRouter({
  new: protectedProcedure
    .input((i) => parse(createWorkspaceSchema, i))
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.slug, { lower: true });
      const inviteId = createId();
      const image =
        input.image.length > 0
          ? input.image
          : `https://api.dicebear.com/7.x/initials/svg?seed=${input.name}`;

      try {
        await ctx.db.transaction(async (trx) => {
          const w = await trx
            .insert(workspaces)
            .values({
              name: input.name,
              createdById: ctx.session.user.id,
              inviteLink: createWorkspaceInviteLink(slug, inviteId),
              slug,
              image,
            })
            .returning({ id: workspaces.id })
            .execute();

          await trx.insert(usersOnWorkspaces).values({
            workspaceSlug: slug,
            workspaceId: w[0]?.id ?? 0,
            userId: ctx.session.user.id,
            role: "admin",
            permissions: JSON.stringify(adminPermissions),
          });
        });
      } catch (e) {
        if (e instanceof DatabaseError && e.body.message.includes("AlreadyExists")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Workspace with this url already exists",
          });
        }

        throw e;
      }

      const cookiesStore = cookies();
      cookiesStore.set(RECENT_WORKSPACE_KEY, slug, {
        path: "/",
        sameSite: "lax",
      });
      cookiesStore.set(USER_WORKSPACE_ROLE, "admin", {
        path: "/",
        sameSite: "lax",
      });
      cookiesStore.set(USER_WORKSPACE_PERMISSIONS, JSON.stringify(adminPermissions), {
        path: "/",
        sameSite: "lax",
      });

      return {
        success: true,
        slug,
      };
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
      const [workspace, viewer] = await Promise.all([
        ctx.db.query.workspaces.findFirst({
          where: (t, op) => op.eq(t.slug, input.slug),
        }),
        ctx.db.query.usersOnWorkspaces.findFirst({
          where: (t, op) =>
            op.and(op.eq(t.userId, ctx.session.user.id), op.eq(t.workspaceSlug, input.slug)),
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
        ...workspace,
        viewerPermissions: parsePermissions(viewer.permissions),
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
    .query(async ({ ctx, input }) => {
      const viewer = await ctx.db.query.usersOnWorkspaces.findFirst({
        where: (t, op) => {
          return op.and(op.eq(t.userId, ctx.session.user.id), op.eq(t.workspaceSlug, input.slug));
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
        }),
        i,
      ),
    )
    .mutation(async ({ input }) => {
      const cookiesStore = cookies();

      cookiesStore.set(RECENT_WORKSPACE_KEY, input.workspaceSlug, {
        path: "/",
        sameSite: "lax",
      });

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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found or not yours 🤔",
        });
      }

      const inviteId = createId();
      const newLink = createWorkspaceInviteLink(input.workspaceSlug, inviteId);

      await ctx.db.update(workspaces).set({
        inviteLink: newLink,
      });

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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      const [newMember] = await ctx.db
        .insert(usersOnWorkspaces)
        .values({
          role: "member",
          userId: ctx.session.user.id,
          workspaceSlug: input.workspaceSlug,
          workspaceId: workspace.id,
        })
        .returning({
          newMember: usersOnWorkspaces.userId,
        });

      if (!newMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Failed to join workspace",
        });
      }

      await Promise.all([
        ctx.db.update(workspaces).set({
          seatCount: workspace.seatCount + 1,
        }),
        ctx.db
          .delete(workspaceInvitations)
          .where(
            and(
              eq(workspaceInvitations.workspaceSlug, input.workspaceSlug),
              eq(workspaceInvitations.email, input.userEmail),
            ),
          ),
      ]);

      return {
        success: true,
      };
    }),
});
