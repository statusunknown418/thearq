import { type ReactNode } from "react";
import { SettingsNav } from "~/components/layout/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex h-full">
      <SettingsNav />

      <div className="flex flex-grow flex-col">{children}</div>
    </section>
  );
}
