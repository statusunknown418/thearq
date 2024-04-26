import { formatDate } from "date-fns";
import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";
import { WeekDetails } from "./WeekDetails";

export const WeekWrapperRSC = async () => {
  const now = new Date();
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  const data = await api.entries.getByMonth.query({
    workspaceId: Number(workspaceId),
    monthDate: formatDate(now, "yyyy-MM"),
  });

  return <WeekDetails initialData={data} workspaceId={Number(workspaceId)} date={now} />;
};
