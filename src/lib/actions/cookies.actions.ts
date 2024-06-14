"use server";

import { cookies } from "next/headers";
import { RECENT_WORKSPACE_KEY, RECENT_W_ID_KEY, USER_WORKSPACE_ROLE } from "~/lib/constants";
import { type Roles } from "~/server/db/edge-schema";

/**
 * Simple action to set cookies as recent workspace, permissions won't be handled here
 * as that would be a high security risk.
 * @param ctx slug, id
 * @returns
 */
export const updateCookiesAction = async (ctx: FormData) => {
  const data = Object.fromEntries(ctx.entries()) as {
    slug: string;
    permissions: string;
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
export const getUserRole = async () => {
  const store = cookies();
  return store.get(USER_WORKSPACE_ROLE)?.value as Roles;
};

export const getLatestWorkspace = async () => {
  const store = cookies();
  return store.get(RECENT_WORKSPACE_KEY)?.value;
};

export const collapseSidebar = async () => {
  const store = cookies();
  const prev = store.get("sidebar-state")?.value;

  if (prev === "open") {
    store.set("sidebar-state", "closed", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
  } else {
    store.set("sidebar-state", "open", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
  }
};
