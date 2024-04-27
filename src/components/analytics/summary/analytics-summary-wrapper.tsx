import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { dateToMonthDate } from "~/lib/stores/events-store";
import { api } from "~/trpc/server";
import { AnalyticsSummary } from "./AnalyticsSummary";

export const AnalyticsSummaryWrapperRSC = async () => {
  const now = new Date();
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const data = await api.viewer.getAnalyticsMetrics.query({
    workspaceId: Number(workspaceId),
    monthDate: dateToMonthDate(now),
  });

  return <AnalyticsSummary initialData={data} workspaceId={Number(workspaceId)} date={now} />;
};
