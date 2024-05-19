import { type UserPermissions, parsePermissions } from "~/lib/stores/auth-store";
import { mergeTRPCRouters } from "../../trpc";
import { baseProjectsRouter } from "./base";
import { chartsRouter } from "./charts";

export const hasServer = (perms: UserPermissions, data: string) => {
  const formatted = parsePermissions(data);
  return formatted.includes(perms);
};

export const projectsRouter = mergeTRPCRouters(baseProjectsRouter, chartsRouter);
