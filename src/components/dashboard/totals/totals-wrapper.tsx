import { api } from "~/trpc/server";
import { Totals } from "./Totals";
import { dashboardCache } from "../dashboard-cache";
import { Skeleton } from "../../ui/skeleton";

export const TotalsWrapperRSC = async () => {
  const { from, to } = dashboardCache.all();

  const data = await api.entries.getTotals.query({
    from,
    to,
  });

  return <Totals initialData={data} />;
};

export const TotalsLoading = () => {
  return (
    <div className="flex justify-between gap-2">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
};
