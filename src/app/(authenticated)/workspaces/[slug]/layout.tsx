import { type ReactNode } from "react";
import { Sidebar } from "~/components/layout/Sidebar";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative grid max-h-screen min-h-screen grid-cols-[200px_auto] bg-secondary-background">
      <Sidebar />

      <section className="max-h-screen py-2 pr-2">
        <div className="h-full overflow-scroll rounded-3xl border border-border/70 bg-background p-4 shadow-xl">
          {children}
        </div>
      </section>

      {/* <nav className="col-span-2 border-l">Secondary collapsible nav</nav> */}
    </section>
  );
}
