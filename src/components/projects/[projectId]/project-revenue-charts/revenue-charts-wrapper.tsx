import { api } from "~/trpc/server";
import { projectAnalyticsParamsCache } from "../project-cache";
import { ProjectRevenueCharts } from "./ProjectRevenueCharts";
import { Skeleton } from "~/components/ui/skeleton";

export const ProjectRevenueChartsWrapperRSC = async ({ projectId }: { projectId: string }) => {
  const { from, to } = projectAnalyticsParamsCache.all();

  const data = await api.projects.getCharts.query({
    projectShareableId: projectId,
    start: from ?? undefined,
    end: to ?? undefined,
  });

  return <ProjectRevenueCharts />;
};

export const ProjectRevenueChartsLoading = () => {
  return (
    <div className="h-full w-full">
      <Skeleton className="h-80 w-full" />
    </div>
  );
};
