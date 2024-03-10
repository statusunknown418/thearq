import { Connect } from "~/app/_ui/connect";

export default function AccountSettingsPage() {
  return (
    <main>
      <h1>Account</h1>

      <p>Connections</p>

      <Connect to="github" />
      <Connect to="linear" />
    </main>
  );
}
