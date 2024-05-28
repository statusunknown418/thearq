import { create } from "zustand";
import { type ClientSchema } from "~/server/db/edge-schema";

type invoicesStore = {
  client: ClientSchema | null;
  update: (data: { client: ClientSchema }) => void;
};

export const useInvoicesStore = create<invoicesStore>((set) => ({
  client: null,
  update: (data) => set(data),
}));
