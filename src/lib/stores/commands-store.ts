import { type SlotInfo } from "react-big-calendar";
import { create } from "zustand";
import { type CustomEvent } from "~/server/api/routers/track";

export type CommandsStore = {
  search: boolean;
  setSearch: (search: boolean) => void;
  track: boolean;
  setTrack: (track: boolean, payload?: CustomEvent & SlotInfo) => void;
};

export const useCommandsStore = create<CommandsStore>((set) => ({
  search: false,
  setSearch: (search) => set({ search }),
  track: false,
  setTrack: (track) => set({ track }),
}));
