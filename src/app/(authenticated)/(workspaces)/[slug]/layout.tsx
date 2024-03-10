import { Suspense, type ReactNode } from "react";
import { SidebarWrapperRSC } from "~/components/layout/Sidebar/sidebar-wrapper";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

export default function SlugWorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative grid max-h-screen min-h-screen grid-cols-[200px_auto] bg-secondary-background">
      <Suspense
        fallback={
          <div className="flex flex-col justify-between gap-3 px-2 py-4">
            <Skeleton className="h-8 w-full" />

            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-full" />
              <Separator />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>

            <Skeleton className="h-8 w-full" />
          </div>
        }
      >
        <SidebarWrapperRSC />
      </Suspense>

      <section className="max-h-screen py-2 pr-2">
        <div className="h-full overflow-scroll rounded-2xl border border-border/70 bg-background">
          {children}
        </div>
      </section>
      {/* <nav className="col-span-2 border-l">Secondary collapsible nav</nav> */}
    </section>
  );
}
