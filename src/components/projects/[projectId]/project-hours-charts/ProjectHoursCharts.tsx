"use client";

import { BarChart, Card, DonutChart, Legend, ProgressBar } from "@tremor/react";
import { secondsToHoursDecimal } from "~/lib/dates";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { useProjectsQS } from "../project-cache";
import { parseNumber } from "~/lib/parsers";

export const ProjectHoursCharts = ({
  initialData,
  projectId,
  children,
}: {
  initialData: RouterOutputs["projects"]["getHoursCharts"];
  projectId: string;
  children?: React.ReactNode;
}) => {
  const [{ from, to }] = useProjectsQS();
  const { data } = api.projects.getHoursCharts.useQuery(
    {
      projectShareableId: projectId,
      start: from,
      end: to,
    },
    {
      initialData,
      refetchOnWindowFocus: false,
    },
  );

  const nonBillablePercentage =
    data.nonBillableHours > 0 ? (data.nonBillableHours / data.totalHours) * 100 : 0;

  return (
    <section className="grid grid-cols-1 gap-4">
      <Card className="p-4">
        <h3 className="text-muted-foreground">Hours per week</h3>
        <p className="mt-1 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          <span>{secondsToHoursDecimal(2355440).toFixed(2)}</span>{" "}
          <span className="text-sm font-normal text-muted-foreground">total hours &middot; </span>
          <span className="text-sm font-normal text-muted-foreground">May 2024</span>
        </p>

        <BarChart
          showAnimation
          data={data.charts}
          valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)} h`}
          animationDuration={700}
          className="mt-2 h-[360px]"
          index="date"
          categories={["duration"]}
        />
      </Card>

      <article className="flex gap-4">
        {children}

        <Card className="flex-grow p-4 tabular-nums">
          <div className="flex items-center justify-start">
            <DonutChart
              data={data.totalHoursByUser}
              index="userName"
              category="hours"
              valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)}h`}
              className="h-32 tabular-nums tracking-wide"
            />

            <Legend categories={data.totalHoursByUser.map((u) => u.userName)} />
          </div>
        </Card>

        <Card className="max-w-xs p-4 tabular-nums">
          <h3 className="text-muted-foreground">Non-billable hours</h3>
          <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {secondsToHoursDecimal(data.nonBillableHours).toFixed(2)}{" "}
            <span className="text-sm font-normal text-muted-foreground">hours</span>
          </p>

          <p className="mt-4 flex items-center justify-between text-muted-foreground">
            <span>
              {data.nonBillableHours > 0 ? parseNumber(nonBillablePercentage) : 0}% of total
            </span>
          </p>
          <ProgressBar value={nonBillablePercentage} color="slate" className="mt-2" />
        </Card>
      </article>
    </section>
  );
};
