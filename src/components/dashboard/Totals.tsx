"use client";

import { dateToMonthDate, secondsToHoursDecimal } from "~/lib/stores/events-store";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

const now = new Date();

export const Totals = ({
  initialData,
  workspaceId,
}: {
  initialData: RouterOutputs["entries"]["getTotals"];
  workspaceId: number;
}) => {
  const { data } = api.entries.getTotals.useQuery(
    {
      workspaceId,
      monthDate: dateToMonthDate(now),
    },
    {
      initialData,
    },
  );

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
