import { env } from "~/env";

export const INTEGRATIONS = {
  linear: {
    name: "linear",
    getTokenUrl: "https://api.linear.app/oauth/token",
    requestAuth: `https://linear.app/oauth/authorize`,
  },
  github: {
    name: "github",
    getTokenUrl: "https://github.com/login/oauth/access_token",
    requestAuth: `https://github.com/apps/${env.NEXT_PUBLIC_GITHUB_APP_NAME}/installations/new`,
  },
} as const;

export type GithubQueryType = "is:issue" | "is:pull-request";

export type Integration = (typeof INTEGRATIONS)[keyof typeof INTEGRATIONS]["name"];
export const INTEGRATION_NAMES = Object.keys(INTEGRATIONS);

export const APP_URL = env.NODE_ENV === "production" ? env.NEXT_PUBLIC_APP_URL : "http://localhost:3000";

export const createWorkspaceInviteLink = (workspaceSlug: string, id: string) =>
  `${APP_URL}/join/${workspaceSlug}/${id}`;

export const RECENT_WORKSPACE_KEY = "recent-workspace-slug";
export const RECENT_W_ID_KEY = "recent-workspace-id";
export const USER_WORKSPACE_PERMISSIONS = "user-workspace-permissions";
export const USER_WORKSPACE_ROLE = "user-workspace-role";

export const LIVE_ENTRY_DURATION = -1;