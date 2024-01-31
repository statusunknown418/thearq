import { env } from "~/env";

export const INTEGRATIONS = {
  linear: {
    name: "linear",
    getTokenUrl: "https://api.linear.app/oauth/token",
    requestAuth: "https://linear.app/oauth/authorize",
  },
  github: {
    name: "github",
    getTokenUrl: "https://github.com/login/oauth/access_token",
    requestAuth: "https://github.com/login/oauth/authorize",
  },
} as const;

export type Integration = (typeof INTEGRATIONS)[keyof typeof INTEGRATIONS]["name"];

export const APP_URL =
  env.NODE_ENV === "production"
    ? "https://mobius-smoky-nu.vercel.app"
    : "http://localhost:3000";
