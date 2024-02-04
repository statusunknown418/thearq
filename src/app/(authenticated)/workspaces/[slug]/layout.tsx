import { type ReactNode } from "react";
import { PageNavigation } from "~/components/layout/Navigation";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative grid max-h-screen min-h-screen grid-cols-12">
      <PageNavigation />
      <section className="col-span-10 max-h-screen overflow-y-scroll">{children}</section>
      {/* <nav className="col-span-2 border-l">Secondary collapsible nav</nav> */}
    </section>
  );
}
