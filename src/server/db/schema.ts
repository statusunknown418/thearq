import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTableCreator,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-valibot";
import { type AdapterAccount } from "next-auth/adapters";
import { array, email, maxLength, minLength, object, omit, string, type Output } from "valibot";
import { memberPermissions } from "~/lib/stores/auth-store";


/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
*
* @see https://orm.drizzle.team/docs/goodies#multi-project-schema
*/
export const mysqlTable = mysqlTableCreator((name) => name);

export const projects = mysqlTable(
  "project",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    shareableId: varchar("shareableId", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 255 }),
    type: mysqlEnum("type", ["fixed", "hourly", "non-billable"]).default("hourly").notNull(),
    workspaceId: bigint("workspaceId", { mode: "number", unsigned: true }).notNull(),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (project) => ({
    workspaceIdIdx: index("workspaceId_idx").on(project.workspaceId),
    nameIndex: index("name_idx").on(project.name),
  }),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.slug],
  }),
  entries: many(timeEntries),
}));

export const timeEntries = mysqlTable(
  "timeEntry",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    /**
     * To avoid timezone issues, the `trackedAt` field will be set within the mutation itself,
     * that way the server will always use the current user's timezone.
     */
    trackedAt: date("trackedAt").notNull(),
    integrationUrl: varchar("integrationUrl", { length: 255 }),
    projectId: bigint("projectId", { mode: "number", unsigned: true }).notNull(),
    workspaceId: bigint("workspaceId", { mode: "number", unsigned: true }).notNull(),
    locked: boolean("locked").notNull().default(false),
    userId: varchar("userId", { length: 255 }).notNull(),
    startTime: datetime("startTime", { mode: "date" }).notNull(),
    billable: boolean("billable").notNull().default(true),
    endTime: datetime("endTime", { mode: "date" }).notNull(),
    duration: int("duration").notNull(),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (timeEntry) => ({
    projectIdIdx: index("projectId_idx").on(timeEntry.projectId),
    userIdIdx: index("userId_idx").on(timeEntry.userId),
    workspaceIdIdx: index("workspaceId_idx").on(timeEntry.workspaceId),
    trackedAtIdx: index("trackedAt_idx").on(timeEntry.trackedAt),
  }),
);

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  project: one(projects, {
    fields: [timeEntries.projectId],
    references: [projects.id],
  }),
  user: one(users, { fields: [timeEntries.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [timeEntries.workspaceId],
    references: [workspaces.id],
  }),
}));

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: datetime("emailVerified", {
    fsp: 3,
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  workspaces: many(usersOnWorkspaces),
  entries: many(timeEntries),
}));

export const workspaceInvitation = mysqlTable(
  "workspaceInvitation",
  {
    workspaceSlug: varchar("workspaceSlug", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    invitedByEmail: varchar("invitedByEmail", { length: 255 }).notNull(),
    accepted: boolean("accepted").default(false),
    createdAt: datetime("created_at", { fsp: 3, mode: "date" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (workspaceInvitation) => ({
    compoundKey: primaryKey({
      columns: [workspaceInvitation.workspaceSlug, workspaceInvitation.email],
    }),
    invitedByEmailIdx: index("invitedByEmail_idx").on(workspaceInvitation.invitedByEmail),
  }),
);

export const sendInviteSchema = object({
  userEmails: array(
    object({
      email: string([email()]),
    }),
    [maxLength(4)],
  ),
  workspaceSlug: string(),
});

export const workspaces = mysqlTable(
  "workspace",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }).notNull(),
    inviteLink: varchar("inviteLink", { length: 255 }).notNull(),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    seatCount: int("seatCount").notNull().default(1),
    userLimit: int("userLimit").notNull().default(3),
    createdAt: datetime("created_at", { fsp: 3, mode: "date" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime("updatedAt", { mode: "date" }).default(
      sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    ),
  },
  (workspace) => ({
    createdByIdIdx: index("createdById_idx").on(workspace.createdById),
    nameIndex: index("name_idx").on(workspace.name),
  }),
);

const workspacesSchema = createInsertSchema(workspaces);
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
  ["id", "inviteLink", "seatCount", "userLimit", "createdAt", "updatedAt", "createdById"],
);

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(usersOnWorkspaces),
  projects: many(projects),
}));

export const roles = ["admin", "manager", "member"] as const;
export type Roles = (typeof roles)[number];

export const usersOnWorkspaces = mysqlTable(
  "usersOnWorkspaces",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    rate: int("billableRate").notNull().default(0),
    internalCost: int("internalCost").notNull().default(0),
    weekCapacity: int("weekCapacity").notNull().default(40),
    workspaceSlug: varchar("workspaceSlug", { length: 255 }).notNull(),
    role: mysqlEnum("role", roles).default("member").notNull(),
    permissions: text("permissions").notNull().default(JSON.stringify(memberPermissions)),
  },
  (userOnWorkspace) => ({
    compoundKey: primaryKey({
      columns: [userOnWorkspace.userId, userOnWorkspace.workspaceSlug],
    }),
    roleIdx: index("role_idx").on(userOnWorkspace.role),
    workspaceSlugIdx: index("workspaceSlug_idx").on(userOnWorkspace.workspaceSlug),
  }),
);

export const addUsersOnWorkspacesSchema = createInsertSchema(usersOnWorkspaces);

export const usersOnWorkspacesRelations = relations(usersOnWorkspaces, ({ one }) => ({
  user: one(users, { fields: [usersOnWorkspaces.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [usersOnWorkspaces.workspaceSlug],
    references: [workspaces.slug],
  }),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsSchema = createInsertSchema(accounts);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: datetime("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: datetime("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
