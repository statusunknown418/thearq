import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import slugify from "slugify";
import { object, parse, string } from "valibot";
import { RECENT_WORKSPACE_KEY, createWorkspaceInviteLink } from "~/lib/constants";
import { adminPermissions, type UserPermissions } from "~/lib/stores/auth-store";
import {
  createWorkspaceSchema,
  usersOnWorkspaces,
  workspaceInvitation,
  workspaces,
} from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workspacesRouter = createTRPCRouter({
  new: protectedProcedure
    .input((i) => parse(createWorkspaceSchema, i))
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.slug, { lower: true });
      const inviteId = createId();
      const image = input.image ?? `https://api.dicebear.com/7.x/initials/svg?seed=${input.name}`;

      await Promise.all([
        ctx.db.insert(workspaces).values({
          name: input.name,
          createdById: ctx.session.user.id,
          inviteLink: createWorkspaceInviteLink(slug, inviteId),
          slug,
          image,
        }),
        ctx.db.insert(usersOnWorkspaces).values({
          userId: ctx.session.user.id,
          workspaceSlug: slug,
          role: "admin",
          permissions: JSON.stringify(adminPermissions),
        }),
      ]);

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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (!viewer?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        });
      }

      const viewerPermissions = JSON.parse(viewer.permissions ?? "[]") as UserPermissions[];

      return {
        ...workspace,
        viewerPermissions,
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
    .mutation(({ input }) => {
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
      const [workspace, join] = await Promise.all([
        ctx.db.query.workspaces.findFirst({
          where: (t, op) => op.eq(t.slug, input.workspaceSlug),
        }),
        ctx.db.insert(usersOnWorkspaces).values({
          role: "member",
          userId: input.userEmail,
          workspaceSlug: input.workspaceSlug,
        }),
      ]);

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (!join.insertId) {
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
          .delete(workspaceInvitation)
          .where(
            and(
              eq(workspaceInvitation.workspaceSlug, input.workspaceSlug),
              eq(workspaceInvitation.email, input.userEmail),
            ),
          ),
      ]);

      return {
        success: true,
      };
    }),
});
