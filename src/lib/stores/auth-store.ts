import { type User } from "next-auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const models = {
  workspace: {
    view: "workspace:view",
    create: "workspace:create",
    edit: "workspace:edit",
    delete: "workspace:delete",
  },
  user: {
    view: "user:view",
    create: "user:invite",
    edit: "user:edit",
    delete: "user:delete",
  },
  rates: {
    view: "rates:view",
    create: "rates:create",
    edit: "rates:edit",
    delete: "rates:delete",
  },
  invoice: {
    view: "invoice:view",
    create: "invoice:create",
    edit: "invoice:edit",
    delete: "invoice:delete",
  },
  client: {
    view: "client:view",
    create: "client:create",
    edit: "client:edit",
    delete: "client:delete",
  },
  project: {
    view: "project:view",
    create: "project:create",
    edit: "project:edit",
    delete: "project:delete",
  },
} as const;

export type UserPermissions =
  (typeof models)[keyof typeof models][keyof (typeof models)[keyof typeof models]];

export const adminPermissions = Object.values(models).flatMap((model) => Object.values(model));
export const memberPermissions = [
  models.workspace.view,
  models.user.create,
  models.rates.view,
  models.project.edit,
];

export type AuthStore = {
  user: User | null;
  permissions: UserPermissions[];
  setUser: (user: User) => void;
  updatePermissions: (permissions: UserPermissions[]) => void;
};

export const useAuthStore = create(
  persist<AuthStore>(
    (set) => ({
      user: null,
      setUser: (user) => {
        set({ user });
      },
      permissions: memberPermissions,
      updatePermissions: (permissions: UserPermissions[]) => set({ permissions }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

export const has = (permission: UserPermissions) => {
  const { permissions } = useAuthStore.getState();
  return permissions.includes(permission);
};

