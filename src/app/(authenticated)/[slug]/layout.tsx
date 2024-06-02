import { Suspense, type ReactNode } from "react";
import { SidebarLoading, SidebarWrapperRSC } from "~/components/layout/Sidebar/sidebar-wrapper";

export default function SlugWorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative grid max-h-screen min-h-screen grid-cols-[210px_auto] gap-0 bg-secondary-background">
      <Suspense fallback={<SidebarLoading />}>
        <SidebarWrapperRSC />
      </Suspense>

      <section className="max-h-screen py-2 pr-2">
        <div className="h-full overflow-y-scroll rounded-xl border border-border/70 bg-background shadow">
          {children}
        </div>
      </section>
    </section>
  );
}
