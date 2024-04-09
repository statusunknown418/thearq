import { createId } from "@paralleldrive/cuid2";
import { formatDate } from "date-fns";
import { relations } from "drizzle-orm";
import { index, int, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-valibot";
import { type AdapterAccount } from "next-auth/adapters";
import {
  array,
  coerce,
  custom,
  email,
  forward,
  maxLength,
  minLength,
  number,
  object,
  omit,
  string,
  type Output,
} from "valibot";
import { env } from "~/env";
import { type Integration } from "~/lib/constants";
import { memberPermissions } from "~/lib/stores/auth-store";

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

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
  invitedBy: one(users, { fields: [workspaceInvitations.invitedById], references: [users.id] }),
}));

export const sendInviteSchema = object({
  userEmails: array(
    object({
      email: string([email()]),
    }),
    [maxLength(4)],
  ),
  workspaceSlug: string(),
});

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
  invitations: many(workspaceInvitations),
  plan: one(workspacePlans, {
    fields: [workspaces.id],
    references: [workspacePlans.workspaceId],
  }),
}));

export const workspacesSchema = createInsertSchema(workspaces);
export type Workspace = Output<typeof workspacesSchema>;

export const createWorkspaceSchema = omit(
  createInsertSchema(workspaces, {
    slug: string([
      minLength(3, "Workspace identifier must be at least 3 characters long"),
      maxLength(255),
    ]),
    name: string([minLength(1, "It needs a name don't you think?"), maxLength(255)]),
    image: string([maxLength(255)]),
  }),
  ["id", "inviteLink", "seatCount", "seatLimit", "createdAt", "createdById"],
);

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
    active: integer("active", { mode: "boolean" }).default(true),
    defaultBillableRate: int("defaultBillableRate").notNull().default(0),
    internalCost: int("internalCost").notNull().default(0),
    defaultWeekCapacity: int("defaultWeekCapacity").default(40),
    permissions: text("permissions", { mode: "text" })
      .notNull()
      .$default(() => JSON.stringify(memberPermissions)),
    allowedToSeeDetails: integer("allowedToSeeDetails", { mode: "boolean" }).default(true),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.userId, t.workspaceId] }),
    workspaceIdIdx: index("usersOnWorkspaces_workspaceId_idx").on(t.workspaceId),
  }),
);

export type UsersOnWorkspacesSchema = Output<typeof usersOnWorkspacesSchema>;
export const usersOnWorkspacesSchema = omit(
  createInsertSchema(usersOnWorkspaces, {
    defaultBillableRate: coerce(number("Rate must be a number"), (v) => Number(v)),
    internalCost: coerce(number("Cost must be a number"), (v) => Number(v)),
    defaultWeekCapacity: coerce(number("Week capacity must be a number"), (v) => Number(v)),
  }),
  ["owner"],
);

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
    projectId: int("projectId"),
    start: integer("start", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    end: integer("end", { mode: "timestamp" }),
    monthDate: text("monthDate")
      .notNull()
      .$defaultFn(() => formatDate(new Date(), "yyyy/MM")),
    integrationUrl: text("integrationUrl"),
    duration: integer("duration").notNull(),
    description: text("description").notNull().default(""),
    locked: integer("locked", { mode: "boolean" }).default(false),
    billable: integer("billable", { mode: "boolean" }).default(true),
    trackedAt: text("trackedAt")
      .notNull()
      .$defaultFn(() => formatDate(new Date(), "yyyy/MM/dd")),
  },
  (t) => ({
    userIdIdx: index("timeEntries_userId_idx").on(t.userId),
    workspaceIdIdx: index("timeEntries_workspaceId_idx").on(t.workspaceId),
    durationIdx: index("timeEntries_duration_idx").on(t.duration),
    trackedAtIdx: index("timeEntries_trackedAt_idx").on(t.trackedAt),
    monthDateIdx: index("timeEntries_monthDate_idx").on(t.monthDate),
  }),
);

export const timeEntrySchema = omit(
  createInsertSchema(timeEntries, {
    description: string([minLength(1)]),
  }),
  ["locked", "userId", "id"],
  [
    forward(
      custom((input) => {
        if (input.start && input.end) {
          return input.start < input.end;
        }

        return true;
      }, 'The "start" date must be before the "end" date'),
      ["end"],
    ),
  ],
);
export type NewTimeEntry = Output<typeof timeEntrySchema>;

export const timeEntrySelect = createInsertSchema(timeEntries);
export type TimeEntry = Output<typeof timeEntrySelect>;

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
    fields: [timeEntries.projectId, timeEntries.workspaceId],
    references: [projects.id, projects.workspaceId],
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
    shareableUrl: text("shareableUrl")
      .notNull()
      .unique()
      .$defaultFn(() => `${env.NEXT_PUBLIC_APP_URL}/portal/projects/${createId()}`),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull().default("#000000"),
    identifier: text("identifier"),
    type: text("type", { enum: projectTypes }).notNull().default("hourly"),
    budget: int("budget").default(0),
    projectHourlyRate: int("projectHourlyRate").default(0),
    startsAt: integer("startsAt", { mode: "timestamp" }),
    endsAt: integer("endsAt", { mode: "timestamp" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceIdIdx: index("projects_workspaceId_idx").on(t.workspaceId),
    shareableUrlIdx: index("projects_shareableUrl_idx").on(t.shareableUrl),
    identifierIdx: index("projects_identifier_idx").on(t.identifier),
  }),
);

export const projectRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  timeEntries: many(timeEntries),
  users: many(usersOnProjects),
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
    permissions: text("permissions", { mode: "text" })
      .notNull()
      .$default(() => JSON.stringify(memberPermissions)),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.userId, t.projectId] }),
    projectIdIdx: index("usersOnProjects_projectId_idx").on(t.projectId),
    userIdIdx: index("usersOnProjects_userId_idx").on(t.userId),
    workspaceIdIdx: index("usersOnProjects_workspaceId_idx").on(t.workspaceId),
  }),
);

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