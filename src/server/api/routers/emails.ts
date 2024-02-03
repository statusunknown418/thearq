import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { parse } from "valibot";
import { env } from "~/env";
import { sendInviteSchema, workspaceInvitation } from "~/server/db/schema";
import WorkspaceInvitation from "~/server/emails/WorkspaceInvitation";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const resend = new Resend(env.RESEND_KEY);

export const emailsRouter = createTRPCRouter({
  sendWorkspaceInvite: protectedProcedure
    .input((i) => parse(sendInviteSchema, i))
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

      try {
        await ctx.db.insert(workspaceInvitation).values(
          input.userEmails.map((item) => ({
            email: item.email,
            workspaceSlug: input.workspaceSlug,
            invitedByEmail: ctx.session.user.email ?? "unknown",
          })),
        );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send invites, maybe the user was already invited?",
        });
      }

      const data = await Promise.all(
        input.userEmails.map(async (item) => {
          return await resend.emails.send({
            // TODO: Update this
            to: "alvarodevcode@outlook.com",
            from: "onboarding@resend.dev",
            subject: `You're invited to join ${workspace.name}`,
            react: WorkspaceInvitation({
              invitedByEmail: ctx.session.user.email ?? "unknown",
              inviteLink: workspace.inviteLink,
              invitedByUsername: ctx.session.user.name ?? "unknown",
              workspaceSlug: input.workspaceSlug,
              teamImage: workspace?.image ?? "https://picsum.photos/200",
              // TODO: Update this
              userEmail: "alvarodevcode@outlook.com",
            }),
          });
        }),
      );

      return {
        success: true,
        data,
      };
    }),
});
