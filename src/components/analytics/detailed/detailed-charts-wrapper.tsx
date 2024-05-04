import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { DetailedCharts } from "./DetailedCharts";
import { analyticsParamsCache } from "../summary/params-cache";

export const DetailedChartsWrapperRSC = async () => {
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const { from, to } = analyticsParamsCache.all();

  const data = await api.viewer.getAnalyticsCharts.query({
    workspaceId: Number(workspaceId),
    startDate: from,
    endDate: to,
  });

  return <DetailedCharts initialData={data} workspaceId={Number(workspaceId)} />;
};
