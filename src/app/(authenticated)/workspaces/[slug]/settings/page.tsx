import { Connect } from "~/app/_ui/connect";

export default function WorkspaceSettingsPage() {
  return (
    <main>
      <h1>Settings</h1>

      <p>Connections</p>

      <Connect to="github" />
      <Connect to="linear" />
    </main>
  );
}
