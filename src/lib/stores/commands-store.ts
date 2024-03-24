import { create } from "zustand";

export type CommandsStore = {
  search: boolean;
  setSearch: (search: boolean) => void;
  track: boolean;
  setTrack: (track: boolean) => void;
};

export const useCommandsStore = create<CommandsStore>((set) => ({
  search: false,
  setSearch: (search) => set({ search }),
  track: false,
  setTrack: (track) => set({ track }),
}));
