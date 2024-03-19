import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Workspace } from "~/server/db/edge-schema";

export type WorkspaceStore = {
  active: Workspace | null;
  setActive: (workspace: Workspace) => void;
};

export const useWorkspaceStore = create(
  persist<WorkspaceStore>(
    (set) => ({
      active: null,
      setActive: (workspace) => set({ active: workspace }),
    }),
    {
      name: "workspace-store",
    },
  ),
);
