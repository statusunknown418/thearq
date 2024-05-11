"use client";

import { Card, DonutChart, Legend, ProgressBar } from "@tremor/react";
import { addDays, format } from "date-fns";
import Link from "next/link";
import { PiArrowRight, PiInfinity, PiInfoBold } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { paymentScheduleToDate } from "~/lib/dates";
import { parseCompactCurrency } from "~/lib/parsers";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { AnalyticsFilters } from "../analytics-filters";
import { useAnalyticsQS } from "./params-cache";

export const AnalyticsSummaryLoading = () => {
  return (
    <div className="flex max-h-52 min-h-52 w-full gap-4">
      <Skeleton className="h-full w-full" />
      <Skeleton className="h-full w-full" />
      <Skeleton className="h-full w-full" />
    </div>
  );
};

export const AnalyticsSummary = ({
  initialData,
  workspaceId,
}: {
  initialData: RouterOutputs["viewer"]["getAnalyticsMetrics"];
  workspaceId: number;
}) => {
  const [state] = useAnalyticsQS();

  const { data, isRefetching, isLoading } = api.viewer.getAnalyticsMetrics.useQuery(
    {
      workspaceId: workspaceId,
      from: state.from,
      to: state.to,
    },
    {
      initialData,
      enabled: !!workspaceId,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  if (isLoading || isRefetching) {
    return <AnalyticsSummaryLoading />;
  }

  const paymentDate = data?.payDate ? paymentScheduleToDate(data.payDate) : null;
  const capacityPercentage = data.capacity ? (data.totalHours / data.capacity) * 100 : 0;

  return (
    <section className="flex flex-col gap-5">
      <AnalyticsFilters />

      <div className="flex gap-4">
        <Card className="max-w-xs" decoration="left" decorationColor="indigo">
          <h4 className="text-tremor-default text-muted-foreground">Earnings</h4>
          <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {parseCompactCurrency(data?.totalEarnings)}
          </p>

          {data.payDate ? (
            <div className="mb-auto mt-4 flex flex-col gap-2">
              <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
                <span>{paymentDate?.format} until pay date!</span>
                <span className="flex items-center gap-1">
                  {format(addDays(new Date(), paymentDate?.difference ?? 0), "do LLLL")}
                  <PiInfoBold size={14} className="text-blue-500" />
                </span>
              </p>

              <ProgressBar
                value={paymentDate?.difference ? ((30 - paymentDate.difference) / 30) * 100 : 0}
                color="indigo"
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs text-tremor-content dark:text-dark-tremor-content">
                No payment schedule set. Contact the workspace owner if this is not expected.
              </p>
            </div>
          )}

          {data.regularEarnings > 0 ? (
            <div className="mt-4 flex flex-col gap-2">
              <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
                <span>
                  {((data.totalEarnings / data.regularEarnings) * 100).toFixed(2)}% of expected
                  earnings
                </span>

                <span>{parseCompactCurrency(data.regularEarnings)}</span>
              </p>

              <ProgressBar
                value={data.totalEarnings ? (data.totalEarnings / data.regularEarnings) * 100 : 0}
                color="fuchsia"
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs text-tremor-content dark:text-dark-tremor-content">
                Due to the current workspace settings, your regular income may vary.
              </p>
            </div>
          )}
        </Card>

        <Card className="max-w-xs">
          <h4 className="text-tremor-default text-muted-foreground">Tracked time</h4>
          <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {data?.totalHours.toFixed(2)}{" "}
            <span className="text-base font-normal text-muted-foreground">hours</span>
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
              <span>
                {!!data.capacity
                  ? `${capacityPercentage.toFixed(2)}% of week capacity`
                  : "No capacity set"}{" "}
              </span>

              <span className="flex items-center gap-1">
                {data.capacity ? `${data.capacity} hours` : <PiInfinity size={16} />}
                <PiInfoBold size={14} className="text-blue-500" />
              </span>
            </p>

            <ProgressBar value={capacityPercentage} />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
              <span>
                {!!data.overtime ? `${data.overtime.toFixed(2)} in overtime` : "No overtime"}
              </span>
              <span>{data.overtime.toFixed(2)} hours</span>
            </p>

            <ProgressBar value={data.overtime} color="orange" />
          </div>
        </Card>

        <Card className="relative flex max-w-full items-center justify-center gap-4">
          <Button variant={"link"} size={"sm"} asChild>
            <Link href="./projects" className="absolute right-4 top-4">
              All projects <PiArrowRight />
            </Link>
          </Button>

          <DonutChart
            showAnimation
            animationDuration={700}
            data={data.projectsByHours}
            valueFormatter={(v) => `${v.toFixed(2)} hours`}
            category="duration"
            index="name"
            className="z-10 w-64"
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
            noDataText={`No projects tracked for this period.`}
          />

          <Legend
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
            categories={data.projectsByHours.map((p) => p.name)}
          />
        </Card>
      </div>
    </section>
  );
};
