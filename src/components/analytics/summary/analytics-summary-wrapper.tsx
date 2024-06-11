import { api } from "~/trpc/server";
import { AnalyticsSummary } from "./AnalyticsSummary";
import { analyticsParamsCache } from "./params-cache";

export const AnalyticsSummaryWrapperRSC = async () => {
  const { from, to } = analyticsParamsCache.all();

  const data = await api.viewer.getAnalyticsMetrics.query({
    from,
    to,
  });

  return <AnalyticsSummary initialData={data} />;
};
