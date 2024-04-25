import { type User } from "next-auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const models = {
  workspace: {
    view: "view:workspace",
    create: "create:workspace",
    edit: "edit:workspace",
    delete: "delete:workspace",
  },
  user: {
    view: "view:user",
    create: "invite:user",
    edit: "edit:user",
    delete: "delete:user",
  },
  rates: {
    view: "view:rates",
    create: "create:rates",
    edit: "edit:rates",
    delete: "delete:rates",
  },
  invoice: {
    view: "view:invoice",
    create: "create:invoice",
    edit: "edit:invoice",
    delete: "delete:invoice",
  },
  client: {
    view: "view:client",
    create: "create:client",
    edit: "edit:client",
    delete: "delete:client",
  },
  project: {
    view: "view:project",
    create: "create:project",
    edit: "edit:project",
    delete: "delete:project",
  },
} as const;

export type UserPermissions =
  (typeof models)[keyof typeof models][keyof (typeof models)[keyof typeof models]];

export const adminPermissions = Object.values(models)
  .map((model) => Object.values(model))
  .flat();

export const memberPermissions = [
  models.workspace.view,
  models.user.create,
  models.rates.view,
  models.project.edit,
];

export const assignPermissions = (perms: UserPermissions[]) => {
  return JSON.stringify(perms ?? []);
};
export const parsePermissions = (perms: string) => {
  return JSON.parse(perms) as UserPermissions[];
};

export type AuthStore = {
  user: User | null;
  permissions: UserPermissions[];
  setUser: (user: User) => void;
  updatePermissions: (permissions: UserPermissions[]) => void;
  clear: () => void;
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
      clear: () => {
        set({ user: null, permissions: [] });
      },
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
