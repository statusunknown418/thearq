"use server";

import { cookies } from "next/headers";
import {
  RECENT_WORKSPACE_KEY,
  RECENT_W_ID_KEY,
  USER_WORKSPACE_PERMISSIONS,
  USER_WORKSPACE_ROLE,
} from "~/lib/constants";
import { type Roles } from "~/server/db/edge-schema";

/**
 * Simple action to set cookies as recent workspace and permissions
 * make sure to decodeURIComponent and parsePermissions when using the permissions
 * @param ctx slug, permissions, role, id
 * @returns
 */
export const updateCookiesAction = async (ctx: FormData) => {
  const data = Object.fromEntries(ctx.entries()) as {
    slug: string;
    permissions: string;
    role: Roles;
    id: string;
  };

  const store = cookies();

  if (!data.slug || !data.permissions) {
    return {
      success: false,
      error: "Invalid data",
    };
  }

  store.set(RECENT_WORKSPACE_KEY, data.slug, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  store.set(USER_WORKSPACE_PERMISSIONS, encodeURIComponent(data.permissions), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  store.set(USER_WORKSPACE_ROLE, data.role, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  store.set(RECENT_W_ID_KEY, data.id, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return {
    success: true,
  };
};

/**
 * Should only be used in a server context
 * @returns
 */
export const getUserRole = () => {
  const store = cookies();
  return store.get(USER_WORKSPACE_ROLE)?.value as Roles;
};

export const getLatestWorkspace = () => {
  const store = cookies();
  return store.get(RECENT_WORKSPACE_KEY)?.value;
};
