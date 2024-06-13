import { api } from "~/trpc/server";
import { Skeleton } from "../../ui/skeleton";
import { Overview } from "./Overview";
import { dashboardCache } from "../dashboard-cache";

export const OverviewWrapperRSC = async () => {
  const { from, to } = dashboardCache.all();
  const data = await api.entries.getDashboardCharts.query({
    from,
    to,
  });

  return <Overview initialData={data} />;
};

export const OverviewLoading = () => {
  return <Skeleton className="aspect-square h-40" />;
};
