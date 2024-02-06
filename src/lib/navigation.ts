import { createNavigationConfig } from "next-safe-navigation";
import { z } from "zod";

export const { routes, useSafeParams, useSafeSearchParams } = createNavigationConfig((defineRoute) => ({
  home: defineRoute("/"),
  workspaces: defineRoute("/workspaces"),
  allWorkspaces: defineRoute("/workspaces"),
  dashboard: defineRoute("/workspaces/[slug]", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  join: defineRoute("/join/[workspace]", {
    params: z.object({
      workspace: z.array(z.string()),
    }),
  }),
  newWorkspace: defineRoute("/new"),
  insights: defineRoute("/workspaces/[slug]/insights", {
    params: z.object({
      slug: z.string(),
    }),
    search: z.object({
      from: z.coerce.date().optional(),
    }),
  }),
}));
