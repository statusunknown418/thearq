"use client";

import { BarChart } from "@tremor/react";
import { secondsToHoursDecimal } from "~/lib/stores/events-store";

const chartData = [
  {
    date: "11/03/2024",
    time: 4588,
  },
  {
    date: "12/03/2024",
    time: 14045,
  },
  {
    date: "13/03/2024",
    time: 0,
  },
  {
    date: "14/03/2024",
    time: 74300,
  },
  {
    date: "15/03/2024",
    time: 28100,
  },
  {
    date: "16/03/2024",
    time: 21000,
  },
  {
    date: "18/03/2024",
    time: 36000,
  },
];

export const DetailedCharts = () => {
  return (
    <section>
      <BarChart
        stack
        data={chartData}
        index="date"
        categories={["time"]}
        colors={["blue"]}
        valueFormatter={(v) => secondsToHoursDecimal(v).toFixed(2)}
        yAxisWidth={48}
      />
    </section>
  );
};
