"use client";

import { formatDate } from "date-fns";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const WeekDetails = ({
  initialData,
  workspaceId,
  date,
}: {
  initialData: RouterOutputs["entries"]["getByMonth"];
  workspaceId: number;
  date: Date;
}) => {
  const { data } = api.entries.getByMonth.useQuery(
    {
      workspaceId: workspaceId,
      monthDate: formatDate(date, "yyyy-MM"),
    },
    {
      initialData,
    },
  );

  return (
    <section>
      <h1>Week Details</h1>
      <p>Details per week and worked hours based on the workspace payment schedule</p>
      <p>Take inspo from Toggl, something dynamic, date range selections</p>
    </section>
  );
};
