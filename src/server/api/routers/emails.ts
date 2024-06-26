import { TRPCError } from "@trpc/server";
import { sendInviteSchema, workspaceInvitations } from "~/server/db/edge-schema";
import { WorkspaceInvitationEmail } from "~/server/emails/WorkspaceInvitation";
import { resend } from "~/server/resend";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * TODO: Update me when the Resend domain is verified
 * @returns
 */
export const emailsRouter = createTRPCRouter({
  /**
   * @description This will fail to send when on development if Turbo is used (--turbo)
   * may work fine in prod and without it
   */
  sendWorkspaceInvite: protectedProcedure
    .input(sendInviteSchema)
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
        await ctx.db.insert(workspaceInvitations).values(
          input.userEmails.map((item) => ({
            email: item.email,
            workspaceSlug: input.workspaceSlug,
            invitedByEmail: ctx.session.user.email ?? "unknown",
            workspaceId: workspace.id,
            invitedById: ctx.session.user.id,
            link: workspace.inviteLink,
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
            text: `You're invited to join ${workspace.name}. Click here to join: ${workspace.inviteLink}`,
            react: WorkspaceInvitationEmail({
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
