"use client";

import { Card, DonutChart, Legend, ProgressBar } from "@tremor/react";
import { addDays, format } from "date-fns";
import { PiInfinity, PiInfoBold } from "react-icons/pi";
import { parseCurrency } from "~/lib/parsers";
import { dateToMonthDate, paymentScheduleToDate } from "~/lib/stores/events-store";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const AnalyticsSummary = ({
  initialData,
  workspaceId,
  date,
}: {
  initialData: RouterOutputs["viewer"]["getAnalyticsMetrics"];
  workspaceId: number;
  date: Date;
}) => {
  const { data } = api.viewer.getAnalyticsMetrics.useQuery(
    {
      workspaceId: workspaceId,
      monthDate: dateToMonthDate(date),
    },
    {
      initialData,
    },
  );

  const paymentDate = data?.payDate ? paymentScheduleToDate(data.payDate) : null;
  const capacityPercentage = data.capacity ? (data.totalHours / data.capacity) * 100 : 0;

  return (
    <section>
      <section className="flex gap-4">
        <Card className="max-w-sm" decoration="left" decorationColor="indigo">
          <h4 className="text-tremor-default text-muted-foreground">Earnings</h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {parseCurrency(data?.totalEarnings)}
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
            <div className="mb-auto mt-4 flex flex-col gap-2">
              <p className="text-xs text-tremor-content dark:text-dark-tremor-content">
                No payment schedule set. Contact the workspace owner if this is not expected.
              </p>
            </div>
          )}
        </Card>

        <Card className="max-w-xs">
          <h4 className="text-tremor-default text-muted-foreground">Tracked time</h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {data?.totalHours.toFixed(2)}h
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
              <span>
                {data.capacity
                  ? `${capacityPercentage.toFixed(2)}% of week capacity`
                  : "No capacity set"}{" "}
              </span>

              <span className="flex items-center gap-1">
                {`${data.capacity?.toFixed(2)} hours` ?? <PiInfinity size={16} />}{" "}
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

        <Card className="flex max-w-full items-center justify-center gap-4">
          <DonutChart
            showAnimation
            animationDuration={700}
            data={data.projectsByHours}
            valueFormatter={(v) => `${v.toFixed(2)} hours`}
            category="duration"
            index="name"
            className="z-10 w-64"
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
          />

          <Legend
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
            categories={data.projectsByHours.map((p) => p.name)}
          />
        </Card>
      </section>
    </section>
  );
};
