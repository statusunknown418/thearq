import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { EntriesViews } from "./EntriesView";

export const CalendarWrapperRSC = async () => {
  const today = new Date();

  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;
  const data = await api.logsHistory.get.query({ workspaceId: Number(workspaceId), date: today });

  return <EntriesViews workspaceId={Number(workspaceId)} initialData={data} />;
};
