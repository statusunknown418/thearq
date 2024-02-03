import { Suspense } from "react";
import { Connect } from "~/app/_ui/connect";
import { WorkspacesList } from "~/app/_ui/workspaces-list";
import { Loader } from "~/components/ui/loader";
import { CreateWorkspace } from "./_ui/NewWorkspace";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dash</h1>

      <Connect to="linear" />
      <Connect to="github" />

      <Suspense fallback={<Loader />}>
        <WorkspacesList />
      </Suspense>

      <CreateWorkspace />
    </div>
  );
}
