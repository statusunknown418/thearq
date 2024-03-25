import { createTRPCRouter } from "~/server/api/trpc";
import { emailsRouter } from "./routers/emails";
import { integrationsRouter } from "./routers/integrations";
import { logsHistoryRouter } from "./routers/logs-history";
import { trackerRouter } from "./routers/track";
import { viewerRouter } from "./routers/viewer";
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
  viewer: viewerRouter,
  tracker: trackerRouter,
  logsHistory: logsHistoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
