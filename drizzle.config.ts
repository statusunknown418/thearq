import { defineConfig } from "drizzle-kit";

import { env } from "./src/env";

export default defineConfig({
  driver: "turso",
  dialect: "sqlite",
  schema: "./src/server/db/edge-schema.ts",
  out: "./src/server/db",
  verbose: true,
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
});
