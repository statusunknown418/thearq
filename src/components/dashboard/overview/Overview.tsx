"use client";

import { Card, DonutChart, Legend } from "@tremor/react";
import { secondsToHoursDecimal } from "~/lib/dates";
import { parseLongCurrency } from "~/lib/parsers";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { useDashboardQS } from "../dashboard-cache";

export const Overview = ({
  initialData,
}: {
  initialData: RouterOutputs["entries"]["getDashboardCharts"];
}) => {
  const [state] = useDashboardQS();

  const { data } = api.entries.getDashboardCharts.useQuery(
    {
      from: state.from,
      to: state.to,
    },
    {
      initialData,
    },
  );

  return (
    <section className="flex gap-4">
      <Card className="flex max-w-md flex-col gap-4">
        <h2 className="font-medium">Projects overview</h2>

        <div className="flex flex-col items-center gap-4">
          <DonutChart
            data={data.hoursByProject}
            showAnimation
            animationDuration={700}
            valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)} hours`}
            index="project"
            category="duration"
            className={`z-10 h-44`}
            noDataText={`No team members tracked for this period.`}
          />

          <Legend categories={data.hoursByProject.map((p) => p.project)} />
        </div>
      </Card>

      <Card className="flex max-w-md flex-col gap-4">
        <h2 className="font-medium">Team hours overview</h2>

        <div className="flex flex-col items-center gap-4">
          <DonutChart
            showLabel={false}
            data={data.hoursByPerson}
            showAnimation
            animationDuration={700}
            valueFormatter={(v) => `${secondsToHoursDecimal(v).toFixed(2)} hours`}
            index="name"
            category="duration"
            className="z-10 h-44"
            noDataText={`No team members tracked for this period.`}
          />

          <Legend categories={data.hoursByPerson.map((p) => p.name)} />
        </div>
      </Card>

      <Card className="flex max-w-md flex-col gap-4">
        <h2 className="font-medium">Clients billing overview</h2>

        <div className="flex flex-col items-center gap-4">
          <DonutChart
            data={data.billingByClient}
            showLabel={false}
            showAnimation
            animationDuration={700}
            valueFormatter={(v) => parseLongCurrency(v)}
            index="client"
            category="amount"
            className="z-10 h-44"
            colors={["indigo", "violet", "blue"]}
            noDataText={`No team members tracked for this period.`}
          />

          <Legend
            categories={data.billingByClient.map((p) => p.client)}
            colors={["indigo", "violet", "blue"]}
          />
        </div>
      </Card>
    </section>
  );
};
