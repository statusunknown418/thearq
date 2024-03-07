import { adminPermissions } from "~/lib/stores/auth-store";

export default function WorkspaceTrackerPage() {
  return (
    <main>
      <h1>Tracker</h1>
      {JSON.stringify(adminPermissions, null, 2)}
    </main>
  );
}
