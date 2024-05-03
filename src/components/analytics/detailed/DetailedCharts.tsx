"use client";

import { BarChart, Card } from "@tremor/react";
import { Skeleton } from "~/components/ui/skeleton";
import { useAnalyticsQS } from "~/lib/stores/analytics-store";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const DetailedCharts = ({
  initialData,
  workspaceId,
}: {
  workspaceId: number;
  initialData: RouterOutputs["viewer"]["getAnalyticsCharts"];
}) => {
  const [state] = useAnalyticsQS();

  const { data, isRefetching } = api.viewer.getAnalyticsCharts.useQuery(
    {
      workspaceId,
      startDate: state.from,
      endDate: state.to,
    },
    {
      enabled: !!workspaceId,
      initialData,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  if (isRefetching) {
    return <Skeleton className="h-52 w-full" />;
  }

  return (
    <>
      <Card>
        <h3 className="text-base font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Tracked time for period
        </h3>

        <BarChart
          allowDecimals
          showAnimation
          animationDuration={700}
          data={data}
          index={"date"}
          categories={["time"]}
          colors={["indigo"]}
          valueFormatter={(v) => `${v.toFixed(2)}h`}
          yAxisWidth={48}
          noDataText="No entries for this period."
          tickGap={2}
        />
      </Card>

      <p className="text-xs text-muted-foreground">
        Hover over the bars to see more details about that day.
      </p>
    </>
  );
};
