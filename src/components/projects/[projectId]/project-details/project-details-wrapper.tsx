import { api } from "~/trpc/server";
import { ProjectDetails } from "./ProjectDetails";
import { Skeleton } from "~/components/ui/skeleton";

export const ProjectDetailsWrapperRSC = async ({ id }: { id: string }) => {
  const initialData = await api.projects.getDetails.query({ shareableUrl: id });

  return <ProjectDetails initialData={initialData} />;
};

export const ProjectDetailsLoading = () => {
  return (
    <div className="grid h-full w-full grid-cols-2">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  );
};
