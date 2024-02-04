import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { WorkspacesList } from "~/app/(authenticated)/workspaces/_ui/workspaces-list";
import { Skeleton } from "~/components/ui/skeleton";
import { RECENT_WORKSPACE_KEY } from "~/lib/constants";
import { routes } from "~/lib/navigation";
import { NewWorkspace } from "./_ui/NewWorkspace";

export default function DashboardPage() {
  const slug = cookies().get(RECENT_WORKSPACE_KEY)?.value;

  if (slug) {
    return redirect(routes.dashboard({ slug }));
  }

  return (
    <main className="grid h-screen grid-cols-1 place-items-center bg-gradient-to-br from-primary/20 via-green-300/20">
      <section className="grid w-[500px] grid-cols-1 gap-8 rounded-3xl bg-base-100 p-7 shadow-xl">
        <header>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Select a workspace to continue</p>
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

        <NewWorkspace />
      </section>
    </main>
  );
}
