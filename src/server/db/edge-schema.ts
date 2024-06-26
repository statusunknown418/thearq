import { relations } from "drizzle-orm";
import { index, int, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema as zodInsertSchema } from "drizzle-zod";
import { type AdapterAccount } from "next-auth/adapters";
import { z } from "zod";
import { type Integration } from "~/lib/constants";
import { dateToMonthDate } from "~/lib/dates";
import { memberPermissions } from "~/lib/stores/auth-store";

export const users = sqliteTable(
  "user",
  {
    id: text("id").notNull().primaryKey(),
    name: text("name").default("Unknown user"),
    email: text("email").notNull(),
    emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
    image: text("image"),
    recentWId: int("recentWId"),
  },
  (t) => ({
    emailIdx: index("user_email_idx").on(t.email),
    recentWIdIdx: index("user_recentWId_idx").on(t.recentWId),
  }),
);

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

/**
 * ******************************* ACTUAL TABLES *********************************
 */

export const integrations = sqliteTable(
  "integrations",
  {
    userId: text("userId").notNull(),
    workspaceId: int("workspaceId", { mode: "number" }).notNull(),
    provider: text("provider").$type<Integration>().notNull(),
    access_token: text("access_token").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    scope: text("scope"),
    enabled: int("enabled", { mode: "boolean" }).notNull().default(true),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.userId, t.providerAccountId] }),
    workspaceIdIdx: index("integrations_workspaceId_idx").on(t.workspaceId),
    userIdIdx: index("integrations_userId_idx").on(t.userId),
    providerAccountIdIdx: index("integrations_providerAccountId_idx").on(t.providerAccountId),
  }),
);

export const integrationsRelations = relations(integrations, ({ one }) => ({
  userAndWorkspace: one(usersOnWorkspaces, {
    fields: [integrations.userId, integrations.workspaceId],
    references: [usersOnWorkspaces.userId, usersOnWorkspaces.workspaceId],
  }),
}));

export const workspaceInvitations = sqliteTable(
  "workspaceInvitation",
  {
    id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    workspaceId: int("workspaceId", { mode: "number" })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    invitedById: text("invitedById")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    link: text("inviteLink").notNull(),
  },
  (t) => ({
    emailIdx: index("email_idx").on(t.email),
    invitedByIdIdx: index("invitedById_idx").on(t.invitedById),
    linkIdx: index("inviteLink_idx").on(t.link),
  }),
);

export const workspaceInvitationRelations = relations(workspaceInvitations, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceInvitations.workspaceId],
    references: [workspaces.id],
  }),
  invitedBy: one(users, {
    fields: [workspaceInvitations.invitedById],
    references: [users.id],
  }),
}));

export const sendInviteSchema = z.object({
  userEmails: z.array(z.object({ email: z.string().email() })),
  workspaceSlug: z.string(),
});

const globalPaymentSchedule = ["monthly", "weekly", "bi-monthly"] as const;
export type GlobalPaymentSchedule = (typeof globalPaymentSchedule)[number];
export const lockingSchedules = ["monthly", "weekly", "bi-monthly"] as const;
export type LockingSchedules = (typeof lockingSchedules)[number];

export const workspaces = sqliteTable(
  "workspace",
  {
    id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    image: text("image").notNull(),
    inviteLink: text("link").notNull().unique(),
    createdById: text("createdById")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    seatCount: int("seatCount").notNull().default(1),
    seatLimit: int("seatLimit").notNull().default(3),
    globalLockingSchedule: text("lockingSchedule", { enum: lockingSchedules })
      .notNull()
      .default("monthly"),
    planId: text("planId"),
    globalPaymentSchedule: text("paymentSchedule", { enum: globalPaymentSchedule }),
    /**
     * Default for times will be integer(4) similar to this
     */
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    createdByIdIdx: index("createdById_idx").on(t.createdById),
    nameIdx: index("name_idx").on(t.name),
  }),
);

export const workspacesRelations = relations(workspaces, ({ many, one }) => ({
  users: many(usersOnWorkspaces),
  projects: many(projects),
  invoices: many(invoices),
  invitations: many(workspaceInvitations),
  plan: one(workspacePlans, {
    fields: [workspaces.planId],
    references: [workspacePlans.workspaceId],
  }),
}));

export const workspacesSchema = zodInsertSchema(workspaces);
export type Workspace = z.infer<typeof workspacesSchema>;

export const createWorkspaceSchema = zodInsertSchema(workspaces, {
  slug: z.string().min(3, "Workspace identifier must be at least 3 characters long"),
  name: z.string().min(1, "It needs a name don't you think?").max(255),
  image: z.string().max(255),
}).omit({
  id: true,
  inviteLink: true,
  seatCount: true,
  seatLimit: true,
  createdAt: true,
  createdById: true,
});

export const roles = ["admin", "manager", "member"] as const;
export type Roles = (typeof roles)[number];

export const usersOnWorkspaces = sqliteTable(
  "usersOnWorkspaces",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: int("workspaceId", { mode: "number" })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    owner: integer("owner", { mode: "boolean" }).default(false),
    role: text("role", { enum: roles }).notNull().default("member"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    defaultBillableRate: int("defaultBillableRate").notNull().default(0),
    defaultInternalCost: int("internalCost").notNull().default(0),
    defaultWeekCapacity: int("defaultWeekCapacity").default(40),
    permissions: text("permissions", { mode: "text" })
      .notNull()
      .$default(() => JSON.stringify(memberPermissions)),
    allowedToSeeDetails: integer("allowedToSeeDetails", { mode: "boolean" }).default(true),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.userId, t.workspaceId] }),
    workspaceIdIdx: index("usersOnWorkspaces_workspaceId_idx").on(t.workspaceId),
    ownerIdx: index("usersOnWorkspaces_owner_idx").on(t.owner),
    userIdIdx: index("usersOnWorkspaces_userId_idx").on(t.userId),
  }),
);

export type UsersOnWorkspacesSchema = z.infer<typeof usersOnWorkspacesSchema>;

export const usersOnWorkspacesSchema = zodInsertSchema(usersOnWorkspaces, {
  defaultBillableRate: z.coerce.number(),
  defaultInternalCost: z.coerce.number(),
  defaultWeekCapacity: z.coerce.number(),
}).omit({
  owner: true,
});

export const usersOnWorkspacesRelations = relations(usersOnWorkspaces, ({ one, many }) => ({
  user: one(users, { fields: [usersOnWorkspaces.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [usersOnWorkspaces.workspaceId],
    references: [workspaces.id],
  }),
  integrations: many(integrations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  workspaces: many(usersOnWorkspaces),
  timeEntries: many(timeEntries),
}));

export const timeEntries = sqliteTable(
  "timeEntry",
  {
    id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: int("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
    start: integer("start", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    end: integer("end", { mode: "timestamp" }),
    monthDate: text("monthDate")
      .notNull()
      .$defaultFn(() => dateToMonthDate(new Date())),
    invoiceId: int("invoiceId").references(() => invoices.id, { onDelete: "set null" }),
    integrationUrl: text("integrationUrl"),
    integrationProvider: text("integrationProvider").$type<Integration>(),
    duration: integer("duration").notNull(),
    description: text("description").notNull().default(""),
    locked: integer("locked", { mode: "boolean" }).default(false),
    billable: integer("billable", { mode: "boolean" }).default(true),
    trackedAt: integer("trackedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userIdIdx: index("timeEntries_userId_idx").on(t.userId),
    workspaceIdIdx: index("timeEntries_workspaceId_idx").on(t.workspaceId),
    trackedAtIdx: index("timeEntries_trackedAt_idx").on(t.trackedAt),
    startIdx: index("timeEntries_start_idx").on(t.start),
    endIdx: index("timeEntries_end_idx").on(t.end),
    projectIdIdx: index("timeEntries_projectId_idx").on(t.projectId),
    lockedIdx: index("timeEntries_locked_idx").on(t.locked),
  }),
);

export const timeEntrySchema = zodInsertSchema(timeEntries, {
  description: z.string().min(1, "Description must be at least 1 character long"),
}).omit({
  locked: true,
  userId: true,
  id: true,
  workspaceId: true,
});

export type NewTimeEntry = z.infer<typeof timeEntrySchema>;

export const timeEntrySelect = zodInsertSchema(timeEntries).omit({
  userId: true,
  workspaceId: true,
});
export type TimeEntry = z.infer<typeof timeEntrySelect>;

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [timeEntries.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [timeEntries.projectId],
    references: [projects.id],
  }),
  invoice: one(invoices, {
    fields: [timeEntries.invoiceId],
    references: [invoices.id],
  }),
}));

export const projectTypes = ["fixed", "project-hourly", "hourly", "non-billable"] as const;
export type ProjectTypes = (typeof projectTypes)[number];

export const projects = sqliteTable(
  "project",
  {
    id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
    workspaceId: int("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    shareableUrl: text("shareableUrl").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull().default("#cccccc"),
    identifier: text("identifier"),
    type: text("type", { enum: projectTypes }).notNull().default("hourly"),
    budgetHours: int("budget"),
    budgetResetsPerMonth: int("budgetResetsPerMonth", { mode: "boolean" }).default(false),
    projectHourlyRate: int("projectHourlyRate"),
    ownerId: text("ownerId").notNull(),
    startsAt: integer("startsAt", { mode: "timestamp" }),
    endsAt: integer("endsAt", { mode: "timestamp" }),
    paymentSchedule: text("paymentSchedule", { enum: globalPaymentSchedule }).default("monthly"),
    entriesLockingSchedule: text("entriesLockingSchedule", {
      enum: lockingSchedules,
    }).default("monthly"),
    clientId: int("clientId").references(() => clients.id, { onDelete: "set null" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceIdIdx: index("projects_workspaceId_idx").on(t.workspaceId),
    shareableUrlIdx: index("projects_shareableUrl_idx").on(t.shareableUrl),
    identifierIdx: index("projects_identifier_idx").on(t.identifier),
    clientIdIdx: index("projects_clientId_idx").on(t.clientId),
    ownerIdIdx: index("projects_ownerId_idx").on(t.ownerId),
  }),
);

export const projectsSchema = zodInsertSchema(projects, {
  name: z.string().min(3, "Name must be at least 3 characters long"),
  budgetHours: z.coerce.number(),
})
  .omit({
    workspaceId: true,
    shareableUrl: true,
    ownerId: true,
  })
  .refine((input) => {
    if (input.startsAt && input.endsAt) {
      return input.startsAt < input.endsAt;
    }

    return true;
  }, "The end date must be after the start date");

export type ProjectSchema = z.infer<typeof projectsSchema>;

export const projectRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  timeEntries: many(timeEntries),
  invoices: many(invoicesToProjects),
  users: many(usersOnProjects),
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
}));

export const clients = sqliteTable(
  "client",
  {
    id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
    workspaceId: int("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    address: text("address"),
    notes: text("notes"),
    createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceIdIdx: index("clients_workspaceId_idx").on(t.workspaceId),
  }),
);

export const clientsSchema = zodInsertSchema(clients).omit({
  workspaceId: true,
});
export type ClientSchema = z.infer<typeof clientsSchema>;

export const clientsRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id],
  }),
  projects: many(projects),
  invoices: many(invoices),
}));

export const usersOnProjects = sqliteTable(
  "usersOnProjects",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: int("projectId", { mode: "number" })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    workspaceId: int("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    role: text("role", { enum: roles }).notNull().default("member"),
    billableRate: int("billableRate").notNull().default(0),
    internalCost: int("internalCost").notNull().default(0),
    permissions: text("permissions", { mode: "text" })
      .notNull()
      .$default(() => JSON.stringify(memberPermissions)),
    fromDefault: integer("fromDefault", { mode: "boolean" }).default(true),
    weekCapacity: int("capacity").default(40),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.userId, t.projectId] }),
    projectIdIdx: index("usersOnProjects_projectId_idx").on(t.projectId),
    userIdIdx: index("usersOnProjects_userId_idx").on(t.userId),
    workspaceIdIdx: index("usersOnProjects_workspaceId_idx").on(t.workspaceId),
  }),
);

export const userProjectSchema = zodInsertSchema(usersOnProjects, {
  billableRate: z.coerce.number(),
  internalCost: z.coerce.number(),
  weekCapacity: z.coerce.number(),
}).omit({
  userId: true,
  projectId: true,
  workspaceId: true,
});

export type ProjectUserSchema = z.infer<typeof userProjectSchema>;

export const usersOnProjectsRelations = relations(usersOnProjects, ({ one }) => ({
  user: one(users, { fields: [usersOnProjects.userId], references: [users.id] }),
  project: one(projects, {
    fields: [usersOnProjects.projectId, usersOnProjects.workspaceId],
    references: [projects.id, projects.workspaceId],
  }),
}));

export const workspacePlans = sqliteTable(
  "workspacePlans",
  {
    planId: text("planId").notNull().primaryKey(),
    workspaceId: int("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    active: integer("active", { mode: "boolean" }).default(true),
    name: text("name").notNull(),
    description: text("description"),
    checkoutUrl: text("checkoutUrl").notNull(),
    startsAt: integer("startsAt", { mode: "timestamp" }),
    endsAt: integer("endsAt", { mode: "timestamp" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceIdIdx: index("workspacePlans_workspaceId_idx").on(t.workspaceId),
  }),
);

export const workspacePlansRelations = relations(workspacePlans, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspacePlans.workspaceId],
    references: [workspaces.id],
  }),
}));

export const invoiceStatus = ["draft", "sent", "paid", "overdue"] as const;
export type InvoiceStatus = (typeof invoiceStatus)[number];
export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export const invoices = sqliteTable(
  "invoices",
  {
    id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
    workspaceId: int("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clientId: int("clientId")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    subject: text("subject"),
    items: text("items", { mode: "json" }).$type<InvoiceItem[]>(),
    identifier: text("identifier").notNull(),
    notes: text("notes"),
    fromDate: integer("fromDate", { mode: "timestamp" }),
    untilDate: integer("untilDate", { mode: "timestamp" }),
    status: text("status", { enum: invoiceStatus }).notNull().default("draft"),
    total: int("total").notNull(),
    currency: text("currency").notNull().default("USD"),
    taxPercentage: int("taxPercentage").default(0),
    discountPercentage: int("discountPercentage").default(0),
    payedAt: integer("payedAt", { mode: "timestamp" }),
    dueAt: integer("dueAt", { mode: "timestamp" }),
    recurring: integer("recurring", { mode: "boolean" }).default(false),
    createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceIdIdx: index("invoice_workspaceId_idx").on(t.workspaceId),
    clientIdIdx: index("invoice_clientId_idx").on(t.clientId),
  }),
);

export const invoicesToProjects = sqliteTable(
  "invoiceToProjects",
  {
    invoiceId: int("invoiceId")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    projectId: int("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.invoiceId, t.projectId] }),
    projectIdIdx: index("invoiceToProjects_projectId_idx").on(t.projectId),
    invoiceIdIdx: index("invoiceToProjects_invoiceId_idx").on(t.invoiceId),
  }),
);

export const invoicesToProjectsRelations = relations(invoicesToProjects, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoicesToProjects.invoiceId],
    references: [invoices.id],
  }),
  project: one(projects, {
    fields: [invoicesToProjects.projectId],
    references: [projects.id],
  }),
}));

export const minInvoiceSchema = zodInsertSchema(invoices, {
  subject: z.string().min(3, "Subject must be at least 3 characters long"),
  total: z.number().optional(),
  items: z.array(
    z.object({
      description: z.string().min(3, "Description must be at least 3 characters long"),
      quantity: z.coerce.number(),
      unitPrice: z.coerce.number(),
    }),
  ),
}).omit({
  workspaceId: true,
});

export const projectsInvoiceSchema = z.object({
  projects: z.array(z.number()),
  includeHours: z.enum(["all", "range", "none"]),
});

export const invoicesSchema = projectsInvoiceSchema.merge(minInvoiceSchema);

export type InvoiceSchema = z.infer<typeof invoicesSchema>;

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [invoices.workspaceId],
    references: [workspaces.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  projects: many(invoicesToProjects),
  linkedEntries: many(timeEntries),
}));
