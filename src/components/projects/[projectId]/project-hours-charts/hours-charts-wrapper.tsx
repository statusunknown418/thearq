import { Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/server";
import { ProjectBudgetLoading, ProjectBudgetWrapper } from "../project-budget/budget-wrapper";
import { projectAnalyticsParamsCache } from "../project-cache";
import { ProjectHoursCharts } from "./ProjectHoursCharts";

export const ProjectHoursChartsWrapperRSC = async ({ projectId }: { projectId: string }) => {
  const { from, to } = projectAnalyticsParamsCache.all();
  const data = await api.projects.getHoursCharts.query({
    projectShareableId: projectId,
    start: from,
    end: to,
  });

  return (
    <ProjectHoursCharts initialData={data} projectId={projectId}>
      <Suspense fallback={<ProjectBudgetLoading />}>
        <ProjectBudgetWrapper projectId={projectId} />
      </Suspense>
    </ProjectHoursCharts>
  );
};

export const ProjectHoursChartsLoading = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-[360px] w-full" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
};
