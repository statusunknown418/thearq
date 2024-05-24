"use client";

import { AreaChart, Card, CategoryBar, Divider, DonutChart, Legend } from "@tremor/react";
import { differenceInWeeks, formatDistanceToNow, toDate } from "date-fns";
import { format } from "date-fns-tz";
import { PiTrendDownBold, PiTrendUpBold } from "react-icons/pi";
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
              Revenue vs Internal costs - ({format(toDate(adjustEndDate(from)), "PPP")} &rarr;{" "}
              {format(toDate(adjustEndDate(to)), "PPP")})
            </h3>

            <p className="mt-1 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              <span>{parseCompactCurrency(data.grossRevenue)}</span>{" "}
              <span className="text-sm font-normal text-muted-foreground">gross revenue</span>
            </p>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-muted-foreground">
              Expected to end in{" "}
              {data.projectEndsAt && formatDistanceToNow(toDate(data.projectEndsAt))} &middot; (
              {data.projectEndsAt
                ? `${differenceInWeeks(data.projectEndsAt, NOW)} weeks remaining`
                : "Unable to estimate time left because this project has no end date"}
              )
            </p>

            <p className="text-indigo-500 dark:text-indigo-400">
              {data.projectStartsAt ? format(data.projectStartsAt, "PP") : "[No start date]"} &rarr;{" "}
              {data.projectEndsAt ? format(data.projectEndsAt, "PP") : "[No end date]"}
            </p>
          </div>
        </article>

        <AreaChart
          showAnimation
          yAxisWidth={55}
          data={data.charts}
          valueFormatter={parseCompactCurrency}
          animationDuration={700}
          className="mt-2 h-[360px] overflow-visible capitalize"
          index="date"
          categories={["revenue", "cost"]}
          colors={["emerald", "red"]}
        />
      </Card>

      <Divider className="my-0 text-xs">Revenue breakdown</Divider>

      <article className="flex gap-4">
        <Card className="p-4 tabular-nums">
          <p className="text-muted-foreground">Detailed profits & costs</p>

          <div className="mt-2 flex items-center gap-4">
            <p className="text-tremor-metric font-semibold text-emerald-500">
              {parseCompactCurrency(data.revenue)}
            </p>
            <p className="text-tremor-metric font-semibold text-red-500">
              {parseCompactCurrency(data.cost)}
            </p>
          </div>

          <CategoryBar
            className="mt-4"
            colors={["emerald", "red"]}
            values={[data.revenue / 100, data.cost / 100, data.revenue === 0 ? 100 : 0]}
            showLabels={false}
          />

          <div className="flex items-end justify-between">
            <Legend
              className="mt-2"
              categories={["Profits", "Expenses"]}
              colors={["emerald", "red"]}
            />

            <p
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
            </p>
          </div>
        </Card>

        <Card className="flex items-center justify-center p-4 tabular-nums">
          <DonutChart
            showAnimation
            animationDuration={700}
            data={data.groupedByUser}
            valueFormatter={parseCompactCurrency}
            category="revenue"
            index="userName"
            className="h-32 w-44 tabular-nums tracking-wide"
          />

          <Legend categories={data.groupedByUser.map((u) => u.userName)} />
        </Card>
      </article>
    </section>
  );
};
