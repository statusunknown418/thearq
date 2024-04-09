import { formatDate } from "date-fns";
import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { DynamicDateView } from "./DynamicDateView";

export const DateViewWrapperRSC = async () => {
  const now = new Date();
  const monthDate = formatDate(now, "yyyy/MM");
  const workspaceId = Number(cookies().get(RECENT_W_ID_KEY)?.value) ?? 0;

  const data = await api.entries.getByMonth.query({ workspaceId, monthDate });

  return <DynamicDateView initialData={data} workspaceId={workspaceId} />;
};
