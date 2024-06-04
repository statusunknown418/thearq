"use client";

import { secondsToHoursDecimal } from "~/lib/dates";
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

  return (
    <section className="flex gap-4">
      <article className="flex w-max flex-col gap-2 rounded-lg border bg-muted p-4 ">
        <p className="text-xs">Tracked time</p>
        <h2 className="text-xl font-bold">
          {secondsToHoursDecimal(data.totalTime)} <span className="text-sm font-normal">hours</span>
        </h2>
      </article>

      <article className="flex w-max flex-col gap-2 rounded-lg border bg-muted p-4 ">
        <p className="text-xs">Earnings</p>
        <h2 className="text-xl font-bold">${data.totalEarnings} USD</h2>
      </article>
    </section>
  );
};
