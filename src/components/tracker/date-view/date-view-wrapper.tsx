import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { DynamicDateView } from "./DynamicDateView";
import { dateToMonthDate } from "~/lib/dates";

export const DateViewWrapperRSC = async () => {
  const now = new Date();
  const monthDate = dateToMonthDate(now);
  const workspaceId = Number(cookies().get(RECENT_W_ID_KEY)?.value) ?? 0;

  return <DynamicDateView workspaceId={workspaceId} monthDate={monthDate} />;
};
