import { api } from "~/trpc/server";
import { projectAnalyticsParamsCache } from "../project-cache";
import { Skeleton } from "~/components/ui/skeleton";
import { ProjectBudget } from "./ProjectBudget";

export const ProjectBudgetWrapper = async ({ projectId }: { projectId: string }) => {
  const { from, to } = projectAnalyticsParamsCache.all();
  const data = await api.projects.getBudgetRemaining.query({
    projectShareableId: projectId,
    from,
    to,
  });

  return <ProjectBudget initialData={data} projectId={projectId} to={to} from={from} />;
};

export const ProjectBudgetLoading = () => {
  return <Skeleton className="h-44 w-80" />;
};
