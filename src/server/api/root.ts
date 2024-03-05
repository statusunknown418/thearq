import { createTRPCRouter } from "~/server/api/trpc";
import { emailsRouter } from "./routers/emails";
import { integrationsRouter } from "./routers/integrations";
import { workspacesRouter } from "./routers/workspaces";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workspaces: workspacesRouter,
  integrations: integrationsRouter,
  emails: emailsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
