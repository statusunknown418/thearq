import Link from "next/link";
import { Suspense } from "react";
import { WorkspacesList } from "~/components/dashboard/workspaces-list";
import { UserDropdown } from "~/components/layout/UserDropdown";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { routes } from "~/lib/navigation";

export default function AllWorkspacesPage() {
  return (
    <main className="grid h-screen grid-cols-1 place-items-center bg-gradient-to-br">
      <section className="grid w-[600px] grid-cols-1 gap-8 rounded-3xl border bg-muted p-8 shadow-2xl shadow-black">
        <header className="flex justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Welcome back</h1>
            <p className="text-muted-foreground">Select a workspace to continue</p>
          </div>

          <div>
            <UserDropdown />
          </div>
        </header>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          }
        >
          <WorkspacesList />
        </Suspense>

        <div className="flex flex-col gap-2">
          <Separator className="mb-3" />

          <Button asChild className="w-max self-end">
            <Link href={routes.newWorkspace()}>New workspace</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
