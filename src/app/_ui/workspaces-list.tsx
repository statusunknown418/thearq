import Link from "next/link";
import { api } from "~/trpc/server";

export const WorkspacesList = async () => {
  const workspaces = await api.workspaces.get.query();

  return (
    <div>
      <h2>Workspaces</h2>
      <ul className="rounded-lg border p-4">
        {workspaces.map((relation) => (
          <li key={relation.workspaceSlug}>
            <Link href={`/workspaces/${relation.workspace.slug}`}>
              {relation.workspace.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
