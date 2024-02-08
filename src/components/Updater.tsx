"use client";

import { useCallback, useEffect } from "react";
import { useSafeParams } from "~/lib/navigation";
import { useAuthStore } from "~/lib/stores/auth-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { Loader } from "./ui/loader";

/**
 * Dead simple component to update the stored user permissions according to the selected workspace
 * as well as the workspace details itself, this is useful for client components, RSC uses cookies
 * @param param0
 * @returns
 */
export const Updater = ({ workspace }: { workspace: RouterOutputs["workspaces"]["getBySlug"] }) => {
  const updatePermissions = useAuthStore((s) => s.updatePermissions);
  const selectWorkspace = useWorkspaceStore((s) => s.setActive);
  const { slug } = useSafeParams("dashboard");

  const { data } = api.workspaces.getPermissions.useQuery({ slug });

  const memoizedUpdater = useCallback(() => {
    updatePermissions(workspace.viewerPermissions);
    selectWorkspace(workspace);
  }, [selectWorkspace, updatePermissions, workspace]);

  useEffect(() => {
    memoizedUpdater();
  }, [memoizedUpdater]);

  return (
    <div>
      Fuck it&apos;s not instantaneous
      {data ? JSON.stringify(data) : <Loader />}
    </div>
  );
};
