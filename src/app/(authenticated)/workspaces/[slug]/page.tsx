import { Suspense } from "react";
import { Updater } from "~/components/Updater";
import { Main } from "~/components/layout/Main";
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
    <Main>
      <div className="h-96 w-max rounded-xl border bg-muted p-6 text-muted-foreground">
        This is a test to see how the background colors behave
      </div>
      <pre className="row-span-full">{JSON.stringify(workspace, null, 2)}</pre>
      <Suspense>
        <InviteMembers workspace={workspace} />
      </Suspense>

      <Updater workspace={workspace} />
    </Main>
  );
}
