import { api } from "~/trpc/server";
import { Totals } from "./Totals";
import { dashboardCache } from "./dashboard-cache";

export const TotalsWrapperRSC = async () => {
  const { from, to } = dashboardCache.all();

  const data = await api.entries.getTotals.query({
    from,
    to,
  });

  return <Totals initialData={data} />;
};
