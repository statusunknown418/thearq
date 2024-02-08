import { routes } from "~/lib/navigation";
import { Client } from "../../_ui/Client";

export default async function WorkspaceInsightsPage({
  params,
}: {
  params: Record<string, string>;
}) {
  const safeParams = routes.dashboard.$parseParams(params);

  return (
    <main>
      <h1>Insights</h1>

      <p>Shit</p>

      {JSON.stringify(safeParams)}

      <Client />
    </main>
  );
}
