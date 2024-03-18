import { Suspense } from "react";
import { Updater } from "~/components/Updater";
import { Main } from "~/components/layout/Main";
import { api } from "~/trpc/server";
import { InviteTeam } from "../../../../components/dashboard/team/InviteTeam";

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
      <nav></nav>

      <div className="h-96 w-max rounded-2xl border bg-muted p-6 text-muted-foreground">
        This is a test to see how the background colors behave
      </div>

      <Suspense>
        <InviteTeam workspace={workspace} />
      </Suspense>

      <Updater workspace={workspace} />
    </Main>
  );
}
