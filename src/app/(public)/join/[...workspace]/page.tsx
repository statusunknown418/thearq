import { routes } from "~/lib/navigation";

export default async function JoinWorkspacePage({
  params,
}: {
  params: {
    workspace: unknown;
  };
}) {
  const {
    workspace: [workspace, invitation],
  } = routes.join.$parseParams(params);

  return (
    <div>
      {JSON.stringify(params, null, 2)}
      <h1>
        Join {workspace} via {invitation}
      </h1>

      <form>
        <button type="submit">Join</button>
      </form>
    </div>
  );
}
