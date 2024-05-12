import { create } from "zustand";
import { type RouterOutputs } from "~/trpc/shared";
import { receiveAmount } from "../parsers";

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
  setDetails: (details) =>
    set({
      details: {
        ...details,
        defaultBillableRate: receiveAmount(details.defaultBillableRate),
        internalCost: receiveAmount(details.internalCost),
      },
      open: true,
    }),
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

export type ProjectPersonSheet = {
  open: boolean;
  openChange: (open: boolean) => void;
  data: (RouterOutputs["projects"]["getTeam"]["users"][number] & { projectId: number }) | null;
  setData: (
    data: RouterOutputs["projects"]["getTeam"]["users"][number] & { projectId: number },
  ) => void;
  clear: () => void;
};

export const useProjectPersonSheetStore = create<ProjectPersonSheet>((set) => ({
  open: false,
  openChange: (state: boolean) => set({ open: state }),
  data: null,
  setData: (data) =>
    set({
      data: {
        ...data,
        billableRate: receiveAmount(data.billableRate),
        internalCost: receiveAmount(data.internalCost),
      },
      open: true,
    }),
  clear: () => set({ data: null, open: false }),
}));
