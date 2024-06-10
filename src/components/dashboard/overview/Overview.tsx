"use client";

import { Card, DonutChart, Legend } from "@tremor/react";
import { secondsToHoursDecimal } from "~/lib/dates";
import { parseLongCurrency } from "~/lib/parsers";

export const Overview = () => {
  return (
    <section className="flex gap-4">
      <Card className="flex max-w-md flex-col gap-4">
        <h2 className="font-medium">Projects overview</h2>

        <div className="flex flex-col items-center gap-4">
          <DonutChart
            data={[
              {
                person: "Arq",
                hours: 251560,
              },
              {
                person: "InterCorp",
                hours: 232323,
              },
              {
                person: "Harvest",
                hours: 44222,
              },
              {
                person: "Landing page",
                hours: 124222,
              },
            ]}
            showAnimation
            animationDuration={700}
            variant="pie"
            valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)} hours`}
            index="person"
            category="hours"
            className="z-10 h-52 w-52"
            noDataText={`No team members tracked for this period.`}
          />

          <Legend categories={["Arq", "InterCorp", "Harvest", "Landing page"]} />
        </div>
      </Card>

      <Card className="flex max-w-md flex-col gap-4">
        <h2 className="font-medium">Team hours overview</h2>

        <div className="flex flex-col items-center gap-4">
          <DonutChart
            data={[
              {
                person: "John Doe",
                hours: 55156,
              },
              {
                person: "Jane Doe",
                hours: 33233,
              },
              {
                person: "Brunin",
                hours: 44222,
              },
            ]}
            showAnimation
            animationDuration={700}
            variant="pie"
            valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)} hours`}
            index="person"
            category="hours"
            className="z-10 h-52 w-52"
            noDataText={`No team members tracked for this period.`}
          />

          <Legend categories={["John Doe", "Jane Doe", "Brunin"]} />
        </div>
      </Card>

      <Card className="flex max-w-md flex-col gap-4">
        <h2 className="font-medium">Clients billing overview</h2>

        <div className="flex flex-col items-center gap-4">
          <DonutChart
            data={[
              {
                person: "Toggl",
                amount: 551560,
              },
              {
                person: "OpenAI",
                amount: 332330,
              },
              {
                person: "Arq",
                amount: 4422200,
              },
            ]}
            showLabel={false}
            showAnimation
            animationDuration={700}
            valueFormatter={(v) => parseLongCurrency(v)}
            colors={["indigo", "violet", "blue"]}
            index="person"
            category="amount"
            className="z-10 h-52 w-52"
            noDataText={`No team members tracked for this period.`}
          />

          <Legend categories={["Arq", "OpenAI", "Toggl"]} />
        </div>
      </Card>
    </section>
  );
};
