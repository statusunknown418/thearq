import { api } from "~/trpc/server";
import { ProjectDetails } from "./ProjectDetails";
import { Skeleton } from "~/components/ui/skeleton";

export const ProjectDetailsWrapperRSC = async ({ projectId: id }: { projectId: string }) => {
  const initialData = await api.projects.getDetails.query({ shareableUrl: id });

  return <ProjectDetails initialData={initialData} />;
};

export const ProjectDetailsLoading = () => {
  return (
    <div className="h-full w-full">
      <Skeleton className="h-52" />
    </div>
  );
};
