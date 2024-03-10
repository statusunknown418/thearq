import { cookies } from "next/headers";
import { USER_WORKSPACE_ROLE } from "~/lib/constants";
import { type Roles } from "~/server/db/schema";
import { Sidebar } from "./Sidebar";

export const SidebarWrapperRSC = async () => {
  const cookiesStore = cookies();
  const role = cookiesStore.get(USER_WORKSPACE_ROLE)?.value as Roles;

  return <Sidebar role={role} />;
};
