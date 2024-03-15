import { create } from "zustand";
import { type RouterOutputs } from "~/trpc/shared";

export type DetailsSheetsStore = {
  open: boolean;
  openChange: (open: boolean) => void;
  details: RouterOutputs["workspaces"]["getTeamByWorkspaceSlug"][number] | null;
  setDetails: (details: RouterOutputs["workspaces"]["getTeamByWorkspaceSlug"][number]) => void;
  clear: () => void;
};

export const useDetailsSheetStore = create<DetailsSheetsStore>((set) => ({
  open: false,
  openChange: (state: boolean) => set({ open: state }),
  details: null,
  setDetails: (details) => set({ details, open: true }),
  clear: () => set({ details: null, open: false }),
}));
