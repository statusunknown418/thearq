import { cookies } from "next/headers";
import { type ReactNode } from "react";
import { SettingsNav } from "~/components/layout/SettingsNav";
import { USER_WORKSPACE_ROLE } from "~/lib/constants";
import { type Roles } from "~/server/db/edge-schema";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const cookiesStore = cookies();
  const role = cookiesStore.get(USER_WORKSPACE_ROLE)?.value as Roles;

  return (
    <section className="flex h-full">
      <SettingsNav role={role} />

      <div className="flex flex-grow flex-col">{children}</div>
    </section>
  );
}
