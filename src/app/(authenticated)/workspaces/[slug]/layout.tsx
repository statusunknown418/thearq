import { type ReactNode } from "react";
import { Sidebar } from "~/components/layout/Sidebar";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative grid max-h-screen min-h-screen grid-cols-12">
      <Sidebar />

      <section className="col-span-10 max-h-screen p-2.5">
        <div className="h-full overflow-scroll rounded-3xl border border-border/70 bg-secondary-background p-4 shadow-xl">
          {children}
        </div>
      </section>

      {/* <nav className="col-span-2 border-l">Secondary collapsible nav</nav> */}
    </section>
  );
}
