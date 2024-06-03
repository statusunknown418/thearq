"use client";
import { DonutChart } from "@tremor/react";
import { PiClockCountdown, PiEmpty } from "react-icons/pi";
import { Skeleton } from "~/components/ui/skeleton";
import { secondsToHoursDecimal } from "~/lib/dates";
import { parseLongCurrency } from "~/lib/parsers";
import { useProjectPersonSheetStore } from "~/lib/stores/sheets-store";
import { api } from "~/trpc/react";
import { useProjectsQS } from "../project-cache";

export const PersonCharts = () => {
  const projectId = useProjectPersonSheetStore((s) => s.data?.projectId);
  const [{ from, to, user }] = useProjectsQS();

  const { data, isLoading } = api.projects.getPersonCharts.useQuery(
    {
      start: from,
      end: to,
      projectId: projectId ?? 0,
      userId: user ?? "",
    },
    {
      enabled: !!projectId && !!user,
    },
  );

  if (isLoading) {
    return <Skeleton className="h-60 w-full" />;
  }

  return (
    <article className="flex items-center justify-between rounded-lg border bg-secondary p-5">
      <div className="flex h-full w-full flex-col items-center gap-4">
        <p className="text-muted-foreground">Revenue & cost</p>

        {!!data?.totalRevenue && !!data?.totalCost ? (
          <DonutChart
            data={[
              {
                name: "Total revenue",
                value: data?.totalRevenue,
              },
              {
                name: "Internal cost",
                value: data?.totalCost,
              },
            ]}
            index="name"
            category="value"
            valueFormatter={parseLongCurrency}
            colors={["emerald", "red"]}
          />
        ) : (
          <div className="flex aspect-square h-full flex-col items-center justify-center gap-2 rounded-full border-4 p-4 text-xs text-muted-foreground">
            <PiEmpty size={20} />
            No revenue data yet
          </div>
        )}
      </div>

      <div className="flex h-full w-full flex-col items-center gap-4">
        <p className="text-muted-foreground">Hours breakdown</p>

        {!!data?.totalBillableHours && !!data?.totalNonBillableHours ? (
          <DonutChart
            data={[
              {
                name: "Billable hours",
                value: data?.totalBillableHours,
              },
              {
                name: "Non-billable hours",
                value: data?.totalNonBillableHours,
              },
            ]}
            index="name"
            category="value"
            valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)}h`}
            colors={["blue", "yellow"]}
          />
        ) : (
          <div className="flex aspect-square h-full flex-col items-center justify-center gap-2 rounded-full border-4 p-4 text-xs text-muted-foreground">
            <PiClockCountdown size={20} />
            No hours data yet
          </div>
        )}
      </div>
    </article>
  );
};
