import { dateToMonthDate } from "~/lib/dates";
import { api } from "~/trpc/server";
import { Totals } from "./Totals";

export const TotalsWrapperRSC = async () => {
  const today = new Date();

  const data = await api.entries.getTotals.query({
    monthDate: dateToMonthDate(today),
  });

  return <Totals initialData={data} />;
};
