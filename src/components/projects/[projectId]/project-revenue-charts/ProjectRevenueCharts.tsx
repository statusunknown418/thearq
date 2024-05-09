"use client";

import { AreaChart, Card, CategoryBar, Legend, ProgressBar } from "@tremor/react";
import { PiEnvelopeDuotone, PiTrendUpBold } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { parseCurrency, parseNumber } from "~/lib/parsers";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { useProjectsQS } from "../project-cache";
import { format, toDate } from "date-fns-tz";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { NOW } from "~/lib/dates";

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

  const completionPercentage =
    data.projectEndsAt && data.projectStartsAt
      ? Math.round(
          (differenceInDays(toDate(data.projectStartsAt), NOW) /
            differenceInDays(toDate(data.projectStartsAt), toDate(data.projectEndsAt))) *
            100,
        )
      : undefined;

  return (
    <section className="grid grid-cols-1 gap-4">
      <Card className="p-4">
        <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Revenue vs Internal costs
        </h3>

        <p className="mt-1 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          <span>{parseCurrency(data.grossRevenue)}</span>{" "}
          <span className="text-sm font-normal text-muted-foreground">gross revenue</span>
        </p>

        <AreaChart
          showAnimation
          yAxisWidth={75}
          data={data.charts}
          valueFormatter={parseCurrency}
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
              <span className="text-sm font-normal text-muted-foreground">remaining</span>
            </p>
          ) : (
            <p className="mt-1.5 text-muted-foreground">No end date set</p>
          )}

          <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            <span>{completionPercentage ?? "~"}% completion</span>
            <span>
              {data.projectEndsAt ? format(data.projectEndsAt, "PPP") : "No end date set"}
            </span>
          </p>

          <ProgressBar value={completionPercentage ?? 0} className="mt-2" />
        </Card>

        <Card className="flex-grow p-4 tabular-nums">
          <p className="flex items-center gap-2 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            <span>Revenue breakdown</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <PiTrendUpBold size={15} />
              {parseNumber((data.revenue / data.grossRevenue) * 100)}%{" "}
              {data.cost > data.revenue ? "loss" : "profit"}
            </span>
          </p>

          <div className="mt-1.5 flex items-center gap-4">
            <p className="text-tremor-metric font-semibold text-emerald-500">
              {parseCurrency(data.revenue)}
            </p>
            <p className="text-tremor-metric font-semibold text-red-500">
              {parseCurrency(data.cost)}
            </p>
          </div>

          <CategoryBar
            className="mt-4"
            values={[data.revenue / 100, data.cost / 100]}
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
            {parseCurrency(2312)}
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
