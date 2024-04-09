import { create } from "zustand";
import { type CustomEvent } from "~/server/api/routers/entries";

export type CommandsStore = {
  search: boolean;
  setSearch: (search: boolean) => void;
  track: boolean;
  setTrack: (track: boolean) => void;
  defaultValues: undefined | CustomEvent;
  setDefaultValues: (defaultValues: CustomEvent) => void;
  clear: () => void;
};

export const useCommandsStore = create<CommandsStore>((set) => ({
  search: false,
  setSearch: (search) => set({ search }),
  track: false,
  setTrack: (track) => set({ track }),
  defaultValues: undefined,
  setDefaultValues: (defaultValues) => set({ defaultValues }),
  clear: () => set({ track: false, defaultValues: undefined }),
}));
