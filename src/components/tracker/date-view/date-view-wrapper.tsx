import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { dateToMonthDate } from "~/lib/stores/events-store";
import { api } from "~/trpc/server";
import { DynamicDateView } from "./DynamicDateView";

export const DateViewWrapperRSC = async () => {
  const now = new Date();
  const monthDate = dateToMonthDate(now);
  const workspaceId = Number(cookies().get(RECENT_W_ID_KEY)?.value) ?? 0;

  const data = await api.entries.getByMonth.query({ workspaceId, monthDate });

  return <DynamicDateView initialData={data} workspaceId={workspaceId} />;
};
