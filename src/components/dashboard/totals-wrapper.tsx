import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { Totals } from "./Totals";
import { dateToMonthDate } from "~/lib/dates";

export const TotalsWrapperRSC = async () => {
  const today = new Date();
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const data = await api.entries.getTotals.query({
    workspaceId: Number(workspaceId),
    monthDate: dateToMonthDate(today),
  });

  return <Totals initialData={data} workspaceId={Number(workspaceId)} />;
};
