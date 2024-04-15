import { create } from "zustand";
import { type CustomEvent } from "~/server/api/routers/entries";

export type Dialogs = "search" | "auto-tracker" | "new-project" | "new-client" | "new-invoice";

export type CommandsStore = {
  opened: Dialogs | null;
  setCommand: (dialog: Dialogs | null) => void;
  defaultValues: undefined | CustomEvent;
  setDefaultValues: (defaultValues: CustomEvent) => void;
  clear: () => void;
};

export const useCommandsStore = create<CommandsStore>((set) => ({
  opened: null,
  setCommand: (opened) => set({ opened }),
  defaultValues: undefined,
  setDefaultValues: (defaultValues) => set({ defaultValues }),
  clear: () => set({ opened: null, defaultValues: undefined }),
}));
