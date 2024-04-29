import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { DetailedCharts } from "./DetailedCharts";

export const DetailedChartsWrapperRSC = async () => {
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const data = await api.viewer.getAnalyticsCharts.query({
    workspaceId: Number(workspaceId),
    startDate: "2024-04-01",
    endDate: "2024-04-30",
  });

  return <DetailedCharts initialData={data} workspaceId={Number(workspaceId)} />;
};
