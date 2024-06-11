import { api } from "~/trpc/server";
import { analyticsParamsCache } from "../summary/params-cache";
import { DetailedCharts } from "./DetailedCharts";

export const DetailedChartsWrapperRSC = async () => {
  const { from, to } = analyticsParamsCache.all();

  const data = await api.viewer.getAnalyticsCharts.query({
    startDate: from,
    endDate: to,
  });

  return <DetailedCharts initialData={data} />;
};
