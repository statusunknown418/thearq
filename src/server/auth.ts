import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { NextResponse } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";
import { accounts, sessions, users, verificationTokens } from "./db/edge-schema";

/**
 * Next auth v5
 * @see https://authjs.dev/guides/upgrade-to-v5
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
    authorized: ({ auth, request }) => {
      const publicRoutes = ["/", "/join", "/integrations"];

      if (publicRoutes.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
      }

      return !!auth?.user;
    },
  },
  session: {
    strategy: "jwt",
  },
  // @ts-expect-error DrizzleAdapter expects a TableFn<SqlFlavor> but we're using a table defined in our schema
  adapter: DrizzleAdapter(db, (name: string) => {
    return {
      user: users,
      account: accounts,
      session: sessions,
      verificationToken: verificationTokens,
    }[name];
  }),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
