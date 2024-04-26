import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { Updater } from "./Updater";

export const UpdaterWrapperRSC = async ({ slug }: { slug: string }) => {
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const workspace = await api.workspaces.getBySlug.query({
    slug,
    id: Number(workspaceId),
  });

  return <Updater workspace={workspace} />;
};
