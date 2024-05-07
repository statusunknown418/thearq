"use client";

import { AreaChart, Card, CategoryBar, Legend, ProgressBar } from "@tremor/react";
import { PiEnvelopeDuotone, PiTrendUpBold } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { parseCurrency } from "~/lib/parsers";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
import { useProjectsQS } from "../project-cache";

const chartData = [
  {
    date: "1-7 April",
    Billable: 89000,
    Cost: 132000,
  },
  {
    date: "8-15 April",
    Billable: 189000,
    Cost: 434000,
  },
  {
    date: "15-22 April",
    Billable: 92000,
    Cost: 123400,
  },
  {
    date: "22-29 April",
    Billable: 459000,
    Cost: 256000,
  },
  {
    date: "1-8 May",
    Billable: 275600,
    Cost: 124000,
  },
  {
    date: "8-15 May",
    Billable: 332200,
    Cost: 48000,
  },
  {
    date: "15-23 May",
    Billable: 247000,
    Cost: 40000,
  },
  {
    date: "23-30 May",
    Billable: 547500,
    Cost: 120000,
  },
];

export const ProjectRevenueCharts = ({
  initialData,
  projectId,
}: {
  initialData: RouterOutputs["projects"]["getRevenueCharts"];
  projectId: string;
}) => {
  const [{ from, to }, update] = useProjectsQS();

  const { data } = api.projects.getRevenueCharts.useQuery(
    {
      start: from,
      end: to,
      projectShareableId: projectId,
    },
    {
      initialData,
    },
  );

  return (
    <section className="grid grid-cols-1 gap-4">
      <Card className="p-4">
        <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Revenue vs Internal costs
        </h3>

        <p className="mt-1 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          <span>{parseCurrency(2355440)}</span>{" "}
          <span className="text-sm font-normal text-muted-foreground">
            gross revenue &middot; May 2024
          </span>
        </p>

        <AreaChart
          showAnimation
          yAxisWidth={65}
          data={chartData}
          valueFormatter={parseCurrency}
          animationDuration={700}
          className="mt-2 h-[360px]"
          index="date"
          categories={["Billable", "Cost"]}
          colors={["emerald", "red"]}
        />
      </Card>

      <article className="flex gap-4">
        <Card className="max-w-xs p-4">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Time frame
          </h4>

          <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            2 weeks <span className="text-sm font-normal text-muted-foreground">remaining</span>
          </p>

          <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            <span>48% completion</span>
            <span>Oct 21st</span>
          </p>

          <ProgressBar value={52} className="mt-2" />
        </Card>

        <Card className="flex-grow p-4 tabular-nums">
          <p className="flex items-center gap-2 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            <span>Revenue breakdown</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <PiTrendUpBold size={15} /> 66% profit
            </span>
          </p>

          <div className="mt-1.5 flex items-center gap-4">
            <p className="text-tremor-metric font-semibold text-emerald-500">$35,483.00</p>
            <p className="text-tremor-metric font-semibold text-red-500">$11,928.60</p>
          </div>

          <CategoryBar
            className="mt-4"
            values={[10483, 483]}
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
