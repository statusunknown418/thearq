import { Connect } from "~/components/integrations/connect";
import { Main } from "~/components/layout/Main";

export default function AccountSettingsPage() {
  return (
    <Main>
      <h1>Account</h1>

      <p>Connections</p>

      <div>
        <Connect to="github" />
        <Connect to="linear" />
      </div>
    </Main>
  );
}
