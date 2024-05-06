import { Skeleton } from "~/components/ui/skeleton";
import { ProjectHoursCharts } from "./ProjectHoursCharts";

export const ProjectHoursChartsWrapperRSC = async ({ projectId }: { projectId: string }) => {
  return <ProjectHoursCharts />;
};

export const ProjectHoursChartsLoading = () => {
  return (
    <div>
      <Skeleton />
      <Skeleton />
    </div>
  );
};
