export default function JoinWorkspacePage({
  params,
}: {
  params: {
    workspace: string[];
  };
}) {
  const [workspace, invitation] = params.workspace;

  return (
    <div>
      <h1>
        hi {workspace} via {invitation}
      </h1>
      <p>Enter the workspace ID to join</p>
      <form>
        <input type="text" />
        <button type="submit">Join</button>
      </form>
    </div>
  );
}
