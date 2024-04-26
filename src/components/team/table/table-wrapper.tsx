import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/server";
import { TeamTable } from "./TeamTable";

export const TeamTableLoading = () => {
  return <Loader />;
};

export const TeamTableWrapperRSC = async () => {
  const team = await api.teams.getByWorkspace.query();

  return <TeamTable data={team} />;
};
