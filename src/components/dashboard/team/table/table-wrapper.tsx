import { api } from "~/trpc/server";
import { TeamTable } from "./TeamTable";

export const TeamTableWrapperRSC = async ({ slug }: { slug: string }) => {
  const team = await api.workspaces.getTeamByWorkspaceSlug.query({ workspaceSlug: slug });

  return <TeamTable data={team} slug={slug} />;
};
