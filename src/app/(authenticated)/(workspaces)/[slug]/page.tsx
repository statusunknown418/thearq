import { cookies } from "next/headers";
import { Updater } from "~/components/Updater";
import { Main } from "~/components/layout/Main";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";

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

      <Updater workspace={workspace} />
    </Main>
  );
}
