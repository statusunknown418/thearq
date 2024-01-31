import { Connect } from "~/app/_ui/connect";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dash</h1>

      <Connect to="linear" />
      <Connect to="github" />
    </div>
  );
}
