import { api } from "~/trpc/server";
import { Updater } from "./Updater";

export const UpdaterWrapperRSC = async ({ slug }: { slug: string }) => {
  const workspace = await api.workspaces.getBySlug.query({
    slug,
  });

  return <Updater workspace={workspace} />;
};
