"use client";

import { Card, DonutChart, Legend, ProgressBar } from "@tremor/react";
import { addDays, format } from "date-fns";
import { PiInfo, PiInfoBold } from "react-icons/pi";
import { parseCurrency } from "~/lib/parsers";
import { dateToMonthDate, secondsToHoursDecimal } from "~/lib/stores/events-store";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

const sales = [
  {
    name: "Project 1",
    sales: 98000,
  },
  {
    name: "Project X",
    sales: 54000,
  },
  {
    name: "InterCorp",
    sales: 88500,
  },
  {
    name: "IBM",
    sales: 120000,
  },
  {
    name: "IslandsX",
    sales: 230000,
  },
];

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

  return (
    <section className="flex gap-4">
      <Card className="max-w-xs" decoration="left" decorationColor="indigo">
        <h4 className="text-tremor-default text-muted-foreground">Earnings</h4>
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {parseCurrency(data?.totalEarnings)}
        </p>

        <div className="mb-auto mt-4 flex flex-col gap-2">
          <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
            <span>+20% from previous period</span>
            <span>{parseCurrency(5000 * 100)}</span>
          </p>

          <ProgressBar value={50} />
        </div>

        <div className="mb-auto mt-4 flex flex-col gap-2">
          <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
            <span>10 days until pay date</span>
            <span className="flex items-center gap-1">
              {format(addDays(new Date(), 10), "do LLLL")}
              <PiInfoBold size={14} className="text-blue-500" />
            </span>
          </p>

          <ProgressBar value={90} color="emerald" />
        </div>
      </Card>

      <Card className="max-w-xs">
        <h4 className="text-tremor-default text-muted-foreground">Tracked time</h4>
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {secondsToHoursDecimal(data?.totalHours).toFixed(2)} h
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
            <span>10% of week capacity</span>
            <span className="flex items-center gap-1">
              40 hours <PiInfoBold size={14} className="text-blue-500" />
            </span>
          </p>

          <ProgressBar value={100} />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <p className="flex items-center justify-between text-xs text-tremor-content dark:text-dark-tremor-content">
            <span>0% overtime</span>
            <span>0 hours</span>
          </p>

          <ProgressBar value={0} color="orange" />
        </div>
      </Card>

      <Card className="flex max-w-lg items-center justify-center gap-4">
        <DonutChart
          showAnimation
          animationDuration={700}
          data={sales}
          onValueChange={console.log}
          valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)} hours`}
          category="sales"
          index="name"
          className="z-10 w-64"
          colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
        />

        <Legend
          colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
          categories={sales.map((s) => s.name)}
        />
      </Card>
    </section>
  );
};
