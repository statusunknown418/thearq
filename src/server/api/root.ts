import { createTRPCRouter } from "~/server/api/trpc";
import { clientsRouter } from "./routers/clients";
import { emailsRouter } from "./routers/emails";
import { entriesRouter } from "./routers/entries";
import { integrationsRouter } from "./routers/integrations";
import { projectsRouter } from "./routers/projects";
import { teamsRouter } from "./routers/team";
import { trackerRouter } from "./routers/track";
import { viewerRouter } from "./routers/viewer";
import { workspacesRouter } from "./routers/workspaces";
import { invoicesRouter } from "./routers/invoices";
import { plansRouter } from "./routers/plan";

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
  entries: entriesRouter,
  projects: projectsRouter,
  teams: teamsRouter,
  clients: clientsRouter,
  invoices: invoicesRouter,
  plans: plansRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
