import { LinearClient } from "@linear/sdk";
import { Octokit } from "@octokit/core";
import { OAuthApp } from "@octokit/oauth-app";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { object, optional, parse, string } from "valibot";
import { env } from "~/env";
import { APP_URL, INTEGRATIONS, RECENT_W_ID_KEY, type Integration } from "~/lib/constants";
import { integrations } from "~/server/db/edge-schema";
import { redis } from "~/server/upstash";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const buildRedirect = (integration: Integration) => `${APP_URL}/integrations/${integration}`;

export const buildConnectionURL = (integration: Integration) => {
  const redirect = buildRedirect(integration);
  switch (integration) {
    case "linear":
      return `${INTEGRATIONS.linear.requestAuth}?response_type=code&client_id=${env.LINEAR_CLIENT_ID}&redirect_uri=${redirect}&state=${env.INTEGRATIONS_STATE}&scope=read`;
    case "github":
      return `${INTEGRATIONS.github.requestAuth}?client_id=${env.GITHUB_CLIENT_ID}`;
    default:
      return "";
  }
};

export type IntegrationCachingKey = `${string}:${Integration}`;

export const integrationsSchema = object({
  code: string(),
  state: optional(string()),
  workspace: string(),
});

export const integrationsRouter = createTRPCRouter({
  linear: protectedProcedure
    .input((i) => parse(integrationsSchema, i))
    .mutation(async ({ ctx, input }) => {
      if (input.state !== env.INTEGRATIONS_STATE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid state, check env",
        });
      }

      try {
        const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

        if (!workspaceId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No workspace found",
          });
        }

        const redirect = buildRedirect("linear");
        const body = new URLSearchParams({
          code: input.code,
          client_id: env.LINEAR_CLIENT_ID,
          client_secret: env.LINEAR_CLIENT_SECRET,
          redirect_uri: redirect,
          grant_type: "authorization_code",
        });

        const req = await fetch(INTEGRATIONS.linear.getTokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        const data = (await req.json()) as {
          access_token: string;
          scope: string;
          refresh_token: string;
          expires_in: number;
        };

        const linear = new LinearClient({
          accessToken: data.access_token,
        });

        const viewer = await linear.viewer;

        /**
         * Override values if the user has already connected the integration
         */
        await ctx.db.transaction(async (trx) => {
          const exists = await trx.query.integrations.findFirst({
            where: (t, op) => {
              return op.and(
                op.eq(t.userId, ctx.session.user.id),
                op.eq(t.workspaceId, Number(workspaceId)),
                op.eq(t.provider, "linear"),
              );
            },
          });

          if (exists) {
            await trx
              .update(integrations)
              .set({
                access_token: data.access_token,
                providerAccountId: viewer.id,
                scope: data.scope,
                enabled: true,
              })
              .where(
                and(
                  eq(integrations.userId, ctx.session.user.id),
                  eq(integrations.workspaceId, Number(workspaceId)),
                  eq(integrations.provider, "linear"),
                ),
              );
          } else {
            await trx.insert(integrations).values({
              access_token: data.access_token,
              providerAccountId: viewer.id,
              provider: "linear",
              userId: ctx.session.user.id,
              workspaceId: Number(workspaceId),
              scope: data.scope,
              enabled: true,
            });
          }
        });

        try {
          const key: IntegrationCachingKey = `${ctx.session.user.id}:${INTEGRATIONS.linear.name}`;

          await redis.set(key, {
            providerAccountId: viewer.id,
            access_token: data.access_token,
          });
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Caching failed",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        const trpcError = new TRPCError({
          code: "BAD_REQUEST",
          message: "Something happened integrating linear",
          cause: error,
        });

        return { success: false, error: trpcError };
      }
    }),

  github: protectedProcedure
    .input((i) => parse(integrationsSchema, i))
    .mutation(async ({ ctx, input }) => {
      try {
        const redirect = buildRedirect("github");
        const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

        if (!workspaceId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No workspace found",
          });
        }

        const app = new OAuthApp({
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          redirectUrl: redirect,
          defaultScopes: ["issue"],
        });

        const { authentication } = await app.createToken({
          code: input.code,
        });

        const octokit = new Octokit({
          auth: authentication.token,
        });

        const viewer = await octokit.request("GET /user");

        await ctx.db.transaction(async (trx) => {
          const exists = await trx.query.integrations.findFirst({
            where: (t, op) => {
              return op.and(
                op.eq(t.userId, ctx.session.user.id),
                op.eq(t.workspaceId, Number(workspaceId)),
                op.eq(t.provider, "github"),
              );
            },
          });

          if (exists) {
            await trx
              .update(integrations)
              .set({
                access_token: authentication.token,
                providerAccountId: viewer.data.login,
              })
              .where(
                and(
                  eq(integrations.userId, ctx.session.user.id),
                  eq(integrations.workspaceId, Number(workspaceId)),
                  eq(integrations.provider, "github"),
                ),
              );
          } else {
            await trx.insert(integrations).values({
              access_token: authentication.token,
              providerAccountId: viewer.data.login,
              provider: "github",
              userId: ctx.session.user.id,
              workspaceId: Number(workspaceId),
            });
          }
        });

        const key: IntegrationCachingKey = `${ctx.session.user.id}:${INTEGRATIONS.github.name}`;

        await redis.set(key, {
          providerAccountId: viewer.data.login,
          access_token: authentication.token,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        const trpcError = new TRPCError({
          code: "BAD_REQUEST",
          message: "Something happened integrating github",
          cause: JSON.stringify(error, null, 2),
        });

        return { success: false, error: trpcError };
      }
    }),

  disconnect: protectedProcedure
    .input((i) =>
      parse(
        object({
          provider: string(),
        }),
        i,
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const key = `${ctx.session.user.id}:${input.provider}`;
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace found",
        });
      }

      await redis.del(key);

      await ctx.db
        .update(integrations)
        .set({
          enabled: false,
        })
        .where(
          and(
            eq(integrations.userId, ctx.session.user.id),
            eq(integrations.workspaceId, Number(workspaceId)),
            eq(integrations.provider, input.provider as Integration),
          ),
        );

      return { success: true };
    }),
  reconnect: protectedProcedure
    .input((i) =>
      parse(
        object({
          provider: string(),
        }),
        i,
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

      if (!workspaceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace found",
        });
      }

      const [data] = await ctx.db
        .update(integrations)
        .set({
          enabled: true,
        })
        .where(
          and(
            eq(integrations.userId, ctx.session.user.id),
            eq(integrations.workspaceId, Number(workspaceId)),
            eq(integrations.provider, input.provider as Integration),
          ),
        )
        .returning();

      if (!data) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No integration found",
        });
      }

      await redis.set(`${ctx.session.user.id}:${input.provider}`, {
        providerAccountId: data.providerAccountId,
        access_token: data.access_token,
      });

      return { success: true };
    }),
});
