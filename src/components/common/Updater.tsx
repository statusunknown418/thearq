"use client";

import { useCallback, useEffect } from "react";
import { useAuthStore } from "~/lib/stores/auth-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

/**
 * Dead simple component to update the stored user permissions according to the selected workspace
 * as well as the workspace details itself, this is useful for client components, RSC uses cookies
 * @param param0
 * @returns
 */
export const Updater = ({ workspace }: { workspace: RouterOutputs["workspaces"]["getBySlug"] }) => {
  const updatePermissions = useAuthStore((s) => s.updatePermissions);
  const selectWorkspace = useWorkspaceStore((s) => s.setActive);
  const { mutate } = api.workspaces.setRecent.useMutation();

  const memoizedUpdater = useCallback(() => {
    if (!workspace.data) {
      return;
    }

    updatePermissions(workspace.data.viewerPermissions);
    selectWorkspace(workspace.data);
  }, [selectWorkspace, updatePermissions, workspace.data]);

  useEffect(() => {
    memoizedUpdater();
  }, [memoizedUpdater, mutate, workspace.data]);

  return <div />;
};
