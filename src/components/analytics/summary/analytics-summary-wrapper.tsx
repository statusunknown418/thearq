import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { AnalyticsSummary } from "./AnalyticsSummary";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { NOW } from "~/lib/dates";

export const AnalyticsSummaryWrapperRSC = async ({
  start,
  end,
}: {
  start: string;
  end: string | undefined;
}) => {
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const data = await api.viewer.getAnalyticsMetrics.query({
    workspaceId: Number(workspaceId),
    from: start,
    to: end,
  });

  return <AnalyticsSummary initialData={data} workspaceId={Number(workspaceId)} />;
};

export const analyticsParamsCache = createSearchParamsCache({
  from: parseAsString.withDefault(format(startOfWeek(NOW, { weekStartsOn: 1 }), "yyyy-MM-dd")),
  to: parseAsString.withDefault(format(endOfWeek(NOW, { weekStartsOn: 1 }), "yyyy-MM-dd")),
});
