import { type User } from "next-auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthStore = {
  user: User | null;
  setUser: (user: User) => void;
};

export const useAuthStore = create(
  persist<AuthStore>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
