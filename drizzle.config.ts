import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  driver: "mysql2",
  out: "./src/server/db",
  verbose: true,
  dbCredentials: {
    uri: env.DATABASE_URL,
  },
} satisfies Config;
