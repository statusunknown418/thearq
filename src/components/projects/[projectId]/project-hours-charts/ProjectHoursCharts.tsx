"use client";

import { BarChart, Card, DonutChart, Legend, ProgressBar } from "@tremor/react";
import { PiEnvelopeDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { secondsToHoursDecimal } from "~/lib/dates";
import { parseCurrency } from "~/lib/parsers";

const performers = [
  {
    name: "Alvaro",
    hours: 985000,
  },
  {
    name: "Brunin",
    hours: 455600,
  },
  {
    name: "Ridrogo",
    hours: 395000,
  },
  {
    name: "Josebas",
    hours: 245000,
  },
  {
    name: "Juan Pajero",
    hours: 195000,
  },
  {
    name: "Diego Romero",
    hours: 195000,
  },
  {
    name: "Saty",
    hours: 195000,
  },
];

const chartData = [
  {
    date: "1-7 April",
    Hours: 89000,
  },
  {
    date: "8-15 April",
    Hours: 189000,
  },
  {
    date: "15-22 April",
    Hours: 92000,
  },
  {
    date: "22-29 April",
    Hours: 459000,
  },
  {
    date: "1-8 May",
    Hours: 275600,
  },
  {
    date: "8-15 May",
    Hours: 332200,
  },
  {
    date: "15-23 May",
    Hours: 247000,
  },
  {
    date: "23-30 May",
    Hours: 547500,
  },
];

export const ProjectHoursCharts = () => {
  return (
    <section className="grid grid-cols-1 gap-4">
      <Card className="p-4">
        <h3 className="text-muted-foreground">Total hours</h3>
        <p className="mt-1 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          <span>{secondsToHoursDecimal(2355440).toFixed(2)} hours</span>{" "}
          <span className="text-sm font-normal text-muted-foreground">May 2024</span>
        </p>

        <BarChart
          showAnimation
          data={chartData}
          valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)} h`}
          animationDuration={700}
          className="mt-2 h-[360px]"
          index="date"
          categories={["Hours"]}
        />
      </Card>

      <article className="flex gap-4">
        <Card className="max-w-xs p-4">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Budget hours (remaining)
          </h4>
          <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {1250 - 654.29}{" "}
            <span className="text-base font-normal text-muted-foreground">hours</span>
          </p>
          <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            <span>48% of budget</span>
            <span>1250 hours</span>
          </p>

          <ProgressBar value={52} className="mt-2" />
        </Card>

        <Card className="flex-grow p-4 tabular-nums">
          <div className="flex items-center justify-start">
            <DonutChart
              data={performers}
              index="name"
              category="hours"
              valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)}h`}
              className="h-32 tabular-nums tracking-wide"
            />

            <Legend categories={performers.map((p) => p.name)} />
          </div>
        </Card>

        <Card className="max-w-xs p-4 tabular-nums">
          <h3 className="text-muted-foreground">Non-invoiced amount</h3>
          <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {parseCurrency(2312)}
          </p>
          <p className="mt-2  break-words text-muted-foreground">
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
