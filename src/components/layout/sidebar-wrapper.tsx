"use server";

import { cookies } from "next/headers";
import {
  RECENT_WORKSPACE_KEY,
  USER_WORKSPACE_PERMISSIONS,
  USER_WORKSPACE_ROLE,
} from "~/lib/constants";
import { type Roles } from "~/server/db/schema";
import { Sidebar } from "./Sidebar";

export const SidebarWrapperRSC = async () => {
  const cookiesStore = cookies();
  const role = cookiesStore.get(USER_WORKSPACE_ROLE)?.value as Roles;

  return <Sidebar role={role} />;
};

/**
 * Simple action to set cookies as recent workspace and permissions
 * make sure to decodeURIComponent and parsePermissions when using the permissions
 * @param ctx FormaData
 * @returns
 */
export const updateCookiesAction = async (ctx: FormData) => {
  const data = Object.fromEntries(ctx.entries()) as {
    slug: string;
    permissions: string;
    role: Roles;
  };

  const store = cookies();

  if (!data.slug || !data.permissions) {
    return {
      success: false,
      error: "Invalid data",
    };
  }

  store.set(RECENT_WORKSPACE_KEY, data.slug);
  store.set(USER_WORKSPACE_PERMISSIONS, encodeURIComponent(data.permissions), {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
  });
  store.set(USER_WORKSPACE_ROLE, data.role, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
  });

  return {
    success: true,
  };
};
