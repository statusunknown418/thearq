"use client";

import { AreaChart, Card, CategoryBar, Legend } from "@tremor/react";
import { differenceInWeeks, formatDistanceToNow } from "date-fns";
import { format, toDate } from "date-fns-tz";
import { PiEnvelopeDuotone, PiTrendDownBold, PiTrendUpBold } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { NOW, adjustEndDate } from "~/lib/dates";
import { parseCompactCurrency, parseNumber } from "~/lib/parsers";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { useProjectsQS } from "../project-cache";

export const ProjectRevenueCharts = ({
  initialData,
  projectId,
}: {
  initialData: RouterOutputs["projects"]["getRevenueCharts"];
  projectId: string;
}) => {
  const [{ from, to }] = useProjectsQS();

  const { data } = api.projects.getRevenueCharts.useQuery(
    {
      start: from,
      end: to,
      projectShareableId: projectId,
    },
    {
      initialData,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <section className="grid grid-cols-1 gap-4">
      <Card className="p-4">
        <article className="flex justify-between">
          <div>
            <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Revenue vs Internal costs - ({format(adjustEndDate(from), "PPP")} &rarr;{" "}
              {format(adjustEndDate(to), "PPP")})
            </h3>

            <p className="mt-1 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              <span>{parseCompactCurrency(data.grossRevenue)}</span>{" "}
              <span className="text-sm font-normal text-muted-foreground">gross revenue</span>
            </p>
          </div>
        </article>

        <AreaChart
          showAnimation
          yAxisWidth={75}
          data={data.charts}
          valueFormatter={parseCompactCurrency}
          animationDuration={700}
          className="mt-2 h-[360px]"
          index="date"
          categories={["revenue", "cost"]}
          colors={["emerald", "red"]}
        />
      </Card>

      <article className="flex gap-4">
        <Card className="max-w-xs p-4">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Time frame
          </h4>
          {data.projectEndsAt ? (
            <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              {formatDistanceToNow(toDate(data.projectEndsAt))}{" "}
              <span className="text-sm font-normal text-muted-foreground">to go</span>
            </p>
          ) : (
            <p className="mt-1.5 text-muted-foreground">No end date set</p>
          )}

          <p className="mt-2 text-indigo-500 dark:text-indigo-400">
            {data.projectStartsAt ? format(data.projectStartsAt, "PP") : "No start date set"} &rarr;{" "}
            {data.projectEndsAt ? format(data.projectEndsAt, "PP") : "No end date set"}
          </p>

          <p className="mt-2 text-muted-foreground">
            (
            {data.projectEndsAt
              ? `${differenceInWeeks(data.projectEndsAt, NOW)} weeks remaining`
              : "Cannot estimate weeks remaining, because this project has no end date"}
            )
          </p>
        </Card>

        <Card className="flex-grow p-4 tabular-nums">
          <p className="flex items-center gap-2 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            <span>Revenue breakdown</span>
            <span
              className={cn(
                "flex items-center gap-1",
                data.revenue && data.grossRevenue
                  ? data.revenue > data.cost
                    ? "text-emerald-500"
                    : "text-red-500"
                  : "text-muted-foreground",
              )}
            >
              {data.revenue > data.cost ? (
                <PiTrendUpBold size={15} />
              ) : (
                <PiTrendDownBold size={15} />
              )}
              {data.revenue && data.grossRevenue
                ? `${parseNumber((data.revenue / data.grossRevenue) * 100)}%`
                : "N/A"}{" "}
              {data.revenue && data.grossRevenue
                ? data.cost > data.revenue
                  ? "loss"
                  : "profit"
                : ""}
            </span>
          </p>

          <div className="mt-1.5 flex items-center gap-4">
            <p className="text-tremor-metric font-semibold text-emerald-500">
              {parseCompactCurrency(data.revenue)}
            </p>
            <p className="text-tremor-metric font-semibold text-red-500">
              {parseCompactCurrency(data.cost)}
            </p>
          </div>

          <CategoryBar
            className="mt-4"
            values={[data.revenue / 100, data.cost / 100, data.revenue === 0 ? 100 : 0]}
            colors={["emerald", "red"]}
            showLabels={false}
          />

          <Legend
            className="mt-2"
            categories={["Profits", "Expenses"]}
            colors={["emerald", "red"]}
          />
        </Card>

        <Card className="max-w-xs p-4 tabular-nums">
          <h3 className="text-muted-foreground">Non-invoiced amount</h3>
          <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {parseCompactCurrency(2312)}
          </p>
          <p className="mt-2 break-words text-muted-foreground">
            This amount is pending to be invoiced
          </p>
          <Button variant={"secondary"} className="mt-2">
            <PiEnvelopeDuotone size={15} />
            Create invoice
          </Button>
        </Card>
      </article>
    </section>
  );
};
