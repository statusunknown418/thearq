import { createNavigationConfig } from "next-safe-navigation";
import { z } from "zod";

export const publicRoutes = ["/", "/join", "/integrations"];
export const sidebarLinks = {
  dashboard: "dashboard",
  tracker: "tracker",
  projects: "projects",
  invoices: "invoices",
  people: "people",
  settings: "settings",
  quotes: "quotes",
  analytics: "analytics",
  integrations: "integrations",
};

export const settingsLinks = {
  general: null,
  account: "account",
  integrations: "integrations",
  plans: "plans",
  defaultValues: "defaults",
};

export const { routes, useSafeParams, useSafeSearchParams } = createNavigationConfig(
  (defineRoute) => ({
    home: defineRoute("/"),
    allWorkspaces: defineRoute("/select"),
    join: defineRoute("/join/[workspace]", {
      params: z.object({
        workspace: z.array(z.string()),
      }),
    }),
    /**
     * Workspaces routes
     */
    dashboard: defineRoute("/[slug]", {
      params: z.object({
        slug: z.string(),
      }),
      search: z
        .object({
          from: z.coerce.date().optional(),
        })
        .optional(),
    }),
    analytics: defineRoute("/[slug]/analytics", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    tracker: defineRoute("/[slug]/tracker", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    newWorkspace: defineRoute("/new"),
    projects: defineRoute("/[slug]/projects", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    newProject: defineRoute("/[slug]/projects/new", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    editProject: defineRoute("/[slug]/projects/[id]/edit", {
      params: z.object({
        slug: z.string(),
        id: z.string(),
      }),
    }),
    projectId: defineRoute("/[slug]/projects/[id]", {
      params: z.object({
        slug: z.string(),
        id: z.string(),
      }),
    }),
    invoices: defineRoute("/[slug]/invoices", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    invoiceId: defineRoute("/[slug]/invoices/[id]", {
      params: z.object({
        slug: z.string(),
        id: z.string(),
      }),
    }),
    people: defineRoute("/[slug]/people", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    personId: defineRoute("/[slug]/people/[id]", {
      params: z.object({
        slug: z.string(),
        id: z.string(),
      }),
    }),
    settings: defineRoute("/[slug]/settings", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    quotes: defineRoute("/[slug]/quotes", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    newQuote: defineRoute("/[slug]/quotes/new", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    editQuote: defineRoute("/[slug]/quotes/[id]/edit", {
      params: z.object({
        slug: z.string(),
        id: z.string(),
      }),
    }),
    quoteId: defineRoute("/[slug]/quotes/[id]", {
      params: z.object({
        slug: z.string(),
        id: z.string(),
      }),
    }),
    /**
     * User routes
     */
    account: defineRoute("/[slug]/settings/account", {
      params: z.object({
        slug: z.string(),
      }),
    }),
    integrations: defineRoute("/[slug]/settings/integrations", {
      params: z.object({
        slug: z.string(),
      }),
    }),
  }),
);
