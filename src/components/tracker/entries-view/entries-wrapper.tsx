import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { dateToMonthDate } from "~/lib/stores/events-store";
import { api } from "~/trpc/server";
import { EntriesViews } from "./EntriesView";

export const CalendarWrapperRSC = async () => {
  const today = new Date();
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const data = await api.entries.getSummary.query({
    workspaceId: Number(workspaceId),
    monthDate: dateToMonthDate(today),
  });

  return <EntriesViews workspaceId={Number(workspaceId)} initialData={data} />;
};
