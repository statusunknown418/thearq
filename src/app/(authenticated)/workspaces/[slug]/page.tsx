import { Suspense } from "react";
import { Updater } from "~/components/Updater";
import { api } from "~/trpc/server";
import { InviteMembers } from "../_ui/InviteMembers";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const workspace = await api.workspaces.getBySlug.query({ slug: params.slug });

  return (
    <main>
      <h1>Workspace Dashboard</h1>

      <pre>{JSON.stringify(workspace, null, 2)}</pre>

      <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-medium text-neutral-600 transition-all [box-shadow:0px_4px_1px_#a3a3a3] active:translate-y-[2px] active:shadow-none">
        Click me
      </button>

      <Suspense>
        <InviteMembers workspace={workspace} />
      </Suspense>

      <Updater workspace={workspace} />
    </main>
  );
}
