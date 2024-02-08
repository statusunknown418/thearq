import { createNavigationConfig } from "next-safe-navigation";
import { z } from "zod";

export const { routes, useSafeParams, useSafeSearchParams } = createNavigationConfig((defineRoute) => ({
  home: defineRoute("/"),
  allWorkspaces: defineRoute("/workspaces"),
  join: defineRoute("/join/[workspace]", {
    params: z.object({
      workspace: z.array(z.string()),
    }),
  }),
  /**
   * Workspaces routes
   */
  dashboard: defineRoute("/workspaces/[slug]", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  newWorkspace: defineRoute("/new"),
  insights: defineRoute("/workspaces/[slug]/insights", {
    params: z.object({
      slug: z.string(),
    }),
    search: z
      .object({
        from: z.coerce.date().optional(),
      })
      .optional(),
  }),
  projects: defineRoute("/workspaces/[slug]/projects", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  newProject: defineRoute("/workspaces/[slug]/projects/new", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  editProject: defineRoute("/workspaces/[slug]/projects/[id]/edit", {
    params: z.object({
      slug: z.string(),
      id: z.string(),
    }),
  }),
  projectId: defineRoute("/workspaces/[slug]/projects/[id]", {
    params: z.object({
      slug: z.string(),
      id: z.string(),
    }),
  }),
  invoices: defineRoute("/workspaces/[slug]/invoices", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  invoiceId: defineRoute("/workspaces/[slug]/invoices/[id]", {
    params: z.object({
      slug: z.string(),
      id: z.string(),
    }),
  }),
  integrations: defineRoute("/workspaces/[slug]/integrations", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  people: defineRoute("/workspaces/[slug]/people", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  personId: defineRoute("/workspaces/[slug]/people/[id]", {
    params: z.object({
      slug: z.string(),
      id: z.string(),
    }),
  }),
  settings: defineRoute("/workspaces/[slug]/settings", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  quotes: defineRoute("/workspaces/[slug]/quotes", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  newQuote: defineRoute("/workspaces/[slug]/quotes/new", {
    params: z.object({
      slug: z.string(),
    }),
  }),
  editQuote: defineRoute("/workspaces/[slug]/quotes/[id]/edit", {
    params: z.object({
      slug: z.string(),
      id: z.string(),
    }),
  }),
  quoteId: defineRoute("/workspaces/[slug]/quotes/[id]", {
    params: z.object({
      slug: z.string(),
      id: z.string(),
    }),
  }),
  /**
   * User routes
   */
  mySettings: defineRoute("/settings"),
}));
