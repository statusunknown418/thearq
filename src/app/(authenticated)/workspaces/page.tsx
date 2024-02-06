import Link from "next/link";
import { Suspense } from "react";
import { WorkspacesList } from "~/app/(authenticated)/workspaces/_ui/workspaces-list";
import { UserDropdown } from "~/components/layout/UserDropdown";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { routes } from "~/lib/navigation";

export default function AllWorkspacesPage() {
  return (
    <main className="grid h-screen grid-cols-1 place-items-center bg-gradient-to-br">
      <section className="bg-muted grid w-[500px] grid-cols-1 gap-8 rounded-2xl border p-7 shadow-2xl">
        <header className="flex justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-xs text-muted-foreground">Select a workspace to continue</p>
          </div>

          <UserDropdown />
        </header>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-1">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          }
        >
          <WorkspacesList />
        </Suspense>

        <div className="flex flex-col gap-2">
          <Separator className="mb-2" />

          <Button asChild>
            <Link href={routes.newWorkspace()}>New workspace</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
