import { api } from "~/trpc/server";
import { TeamTable } from "./TeamTable";

export const TeamTableWrapperRSC = async () => {
  const team = await api.workspaces.getTeamByWorkspace.query();

  return <TeamTable data={team} />;
};
