"use client";

import { Card, CategoryBar, DonutChart, Legend } from "@tremor/react";
import { format, toDate } from "date-fns-tz";
import { PiTrendDownBold, PiTrendUpBold } from "react-icons/pi";
import { secondsToHoursDecimal } from "~/lib/dates";
import { parseCompactCurrency, parseLongCurrency, parseNumber } from "~/lib/parsers";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { useDashboardQS } from "./dashboard-cache";

export const Totals = ({ initialData }: { initialData: RouterOutputs["entries"]["getTotals"] }) => {
  const [state] = useDashboardQS();

  const { data } = api.entries.getTotals.useQuery(
    {
      from: state.from,
      to: state.to,
    },
    {
      initialData,
    },
  );

  if (!data) {
    return <div>Something happened, please try again later</div>;
  }

  const revenue = data.totalEarnings - data.totalInternalCost;

  return (
    <>
      <p className="text-xs text-muted-foreground">
        Data from {format(toDate(state.from), "PPP")} to {format(toDate(state.to), "PPP")} across
        all projects, clients and teammates.
      </p>

      <section className="flex gap-4">
        <Card decoration="left" className="flex max-w-md flex-col gap-2">
          <p className="text-muted-foreground">Total revenue</p>
          <h2 className="flex text-tremor-metric">{parseLongCurrency(data.totalEarnings)}</h2>

          <CategoryBar
            showLabels={false}
            className="mt-4 w-full"
            colors={["emerald", "red"]}
            values={[data.totalEarnings / 100, data.totalInternalCost / 100]}
          />

          <div className="flex items-end justify-between">
            <Legend
              className="mt-2"
              colors={["emerald", "red"]}
              categories={[
                `${parseCompactCurrency(revenue)} earned`,
                `${parseCompactCurrency(data.totalInternalCost)} spent`,
              ]}
            />

            <p
              className={cn(
                "flex items-center gap-1",
                data.totalEarnings > data.totalInternalCost ? "text-emerald-500" : "text-red-500",
              )}
            >
              {data.totalEarnings > data.totalInternalCost ? (
                <PiTrendUpBold size={15} />
              ) : (
                <PiTrendDownBold size={15} />
              )}

              {`${parseNumber((revenue / data.totalEarnings) * 100)}% `}

              {data.totalInternalCost > revenue ? "loss" : "profit"}
            </p>
          </div>
        </Card>

        <Card className="flex max-w-md flex-col gap-2">
          <h2 className="text-muted-foreground">Tracked time</h2>

          <p className="flex gap-1 text-tremor-metric">
            <span>{secondsToHoursDecimal(data.totalTime)}</span>
            <span className="self-end text-sm text-muted-foreground">hours</span>
          </p>

          <CategoryBar
            showLabels={false}
            className="mt-4 w-full"
            colors={["blue", "yellow"]}
            values={[data.totalTime / 100, data.nonBillableTime / 100]}
          />

          <Legend
            className="mt-2"
            colors={["blue", "yellow"]}
            categories={[
              `${secondsToHoursDecimal(data.totalTime).toFixed(2)} billable time`,
              `${secondsToHoursDecimal(data.nonBillableTime).toFixed(2)} non billable time`,
            ]}
          />
        </Card>

        <Card className="flex items-center justify-between gap-4">
          <DonutChart
            showAnimation
            animationDuration={1000}
            showLabel={false}
            data={data.groupedByProject}
            valueFormatter={(value) => `${secondsToHoursDecimal(value).toFixed(2)} hours`}
            index="project"
            category="duration"
            className="z-10 aspect-square h-36"
          />

          <div className="flex w-full max-w-52 flex-col gap-2">
            <h2 className="font-medium">Projects worked</h2>
            <Legend categories={data.groupedByProject.map((p) => p.project)} />
          </div>
        </Card>
      </section>
    </>
  );
};
