import { type User } from "next-auth";
import { create } from "zustand";

export type AuthStore = {
  user: User | null;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
