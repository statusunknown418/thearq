import { Suspense, type ReactNode } from "react";
import { SettingsLoading, SettingsWrapperRSC } from "~/components/layout/settings/settings-wrapper";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex h-full">
      <Suspense fallback={<SettingsLoading />}>
        <SettingsWrapperRSC />
      </Suspense>

      <div className="flex flex-grow flex-col">{children}</div>
    </section>
  );
}
