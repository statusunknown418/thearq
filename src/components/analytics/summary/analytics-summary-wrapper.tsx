import { cookies, headers } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { AnalyticsSummary } from "./AnalyticsSummary";
import { analyticsParamsCache } from "./params-cache";

export const AnalyticsSummaryWrapperRSC = async () => {
  const { from, to } = analyticsParamsCache.all();
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const requestTZ = headers().get("x-vercel-ip-timezone");

  const data = await api.viewer.getAnalyticsMetrics.query({
    workspaceId: Number(workspaceId),
    from,
    to,
  });

  return (
    <AnalyticsSummary initialData={data} workspaceId={Number(workspaceId)} location={requestTZ} />
  );
};
