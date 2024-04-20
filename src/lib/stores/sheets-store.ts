import { create } from "zustand";
import { type RouterOutputs } from "~/trpc/shared";

export type DetailsSheetsStore = {
  open: boolean;
  openChange: (open: boolean) => void;
  details: RouterOutputs["teams"]["getByWorkspace"][number] | null;
  setDetails: (details: RouterOutputs["teams"]["getByWorkspace"][number]) => void;
  clear: () => void;
};

export const useDetailsSheetStore = create<DetailsSheetsStore>((set) => ({
  open: false,
  openChange: (state: boolean) => set({ open: state }),
  details: null,
  setDetails: (details) => set({ details, open: true }),
  clear: () => set({ details: null, open: false }),
}));

type IntegrationDialogStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useIntegrationDialogStore = create<IntegrationDialogStore>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

type ClientsSheetStore = {
  open: boolean;
  openChange: (open: boolean) => void;
};

export const useClientsSheetStore = create<ClientsSheetStore>((set) => ({
  open: false,
  openChange: (state: boolean) => set({ open: state }),
}));