import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, int, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-valibot";
import { type AdapterAccount } from "next-auth/adapters";
import { array, email, maxLength, minLength, object, omit, string, type Output } from "valibot";
import { env } from "~/env";
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

export const workspaceInvitations = sqliteTable(
  "workspaceInvitation",
  {
    id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    workspaceId: int("workspaceId", { mode: "number" })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    workspaceSlug: text("workspaceSlug").notNull(),
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

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  users: many(usersOnWorkspaces),
  invitations: many(workspaceInvitations),
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
    workspaceSlug: text("workspaceSlug").notNull(),
    owner: integer("owner", { mode: "boolean" }).default(false),
    role: text("role", { enum: roles }).notNull().default("member"),
    billableRate: int("billableRate").notNull().default(0),
    internalCost: int("internalCost").notNull().default(0),
    weekCapacity: int("weekCapacity").notNull().default(40),
    permissions: text("permissions", { mode: "text" })
      .notNull()
      .$default(() => JSON.stringify(memberPermissions)),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.userId, t.workspaceId] }),
    workspaceSlugIdx: index("workspaceId_idx").on(t.workspaceSlug),
  }),
);

export const usersOnWorkspacesRelations = relations(usersOnWorkspaces, ({ one }) => ({
  user: one(users, { fields: [usersOnWorkspaces.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [usersOnWorkspaces.workspaceId],
    references: [workspaces.id],
  }),
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
    workspaceId: text("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    start: integer("start", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    end: integer("end", { mode: "timestamp" }).notNull(),
    integrationUrl: text("integrationUrl"),
    duration: integer("duration").notNull(),
    description: text("description"),
    locked: integer("locked", { mode: "boolean" }).default(false),
    billable: integer("billable", { mode: "boolean" }).default(true),
  },
  (t) => ({
    userIdIdx: index("userId_idx").on(t.userId),
  }),
);

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, { fields: [timeEntries.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [timeEntries.workspaceId],
    references: [workspaces.id],
  }),
}));

export const projectTypes = ["fixed", "hourly", "non-billable"] as const;
export type ProjectTypes = (typeof projectTypes)[number];

export const projects = sqliteTable(
  "project",
  {
    id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
    workspaceId: text("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    workspaceSlug: text("workspaceSlug").notNull(),
    shareableId: text("shareableId")
      .notNull()
      .unique()
      .$defaultFn(() => `${env.NEXT_PUBLIC_APP_URL}/portal/projects/${createId()}`),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull().default("#000000"),
    type: text("type", { enum: projectTypes }).notNull().default("hourly"),
    createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceSlugIdx: index("workspaceSlug_idx").on(t.workspaceSlug),
  }),
);
