import { dateToMonthDate } from "~/lib/dates";
import { api } from "~/trpc/server";
import { EntriesViews } from "./EntriesView";

export const CalendarWrapperRSC = async () => {
  const today = new Date();

  const data = await api.entries.getSummary.query({
    monthDate: dateToMonthDate(today),
  });

  return <EntriesViews initialData={data} />;
};
