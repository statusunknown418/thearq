import { Suspense, type ReactNode } from "react";
import { SidebarLoading, SidebarWrapperRSC } from "~/components/layout/Sidebar/sidebar-wrapper";
import { cn } from "~/lib/utils";

export default function SlugWorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <section
      className={cn(
        "relative flex max-h-screen min-h-screen gap-0 bg-secondary-background transition-transform duration-300",
      )}
    >
      <Suspense fallback={<SidebarLoading />}>
        <SidebarWrapperRSC />
      </Suspense>

      <section className="max-h-screen flex-grow py-2 pr-2">
        <div className="h-full overflow-y-scroll rounded-xl border border-border/70 bg-background shadow">
          {children}
        </div>
      </section>
    </section>
  );
}
