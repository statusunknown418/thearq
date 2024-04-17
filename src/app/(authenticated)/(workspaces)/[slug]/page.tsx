import { cookies } from "next/headers";
import { Suspense } from "react";
import { Updater } from "~/components/Updater";
import { Main } from "~/components/layout/Main";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { InviteTeam } from "../../../../components/dashboard/team/invite/InviteTeam";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const workspace = await api.workspaces.getBySlug.query({
    slug: params.slug,
    id: Number(workspaceId),
  });

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
