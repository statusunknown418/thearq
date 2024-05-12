import { Skeleton } from "~/components/ui/skeleton";
import { ProjectTeamTable } from "./ProjectTeamTable";
import { api } from "~/trpc/server";

export const ProjectTeamWrapper = async ({ id }: { id: string }) => {
  const data = await api.projects.getTeam.query({ projectShareableId: id });
  return <ProjectTeamTable id={id} initialData={data} />;
};

export const ProjectTeamLoading = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[320px] w-full" />
    </div>
  );
};
