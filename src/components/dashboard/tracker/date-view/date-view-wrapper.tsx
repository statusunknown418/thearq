import { formatDate } from "date-fns";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { RECENT_W_ID_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";

const LazyDynamicDateView = dynamic(() =>
  import("./DynamicDateView").then((mod) => mod.DynamicDateView),
);

export const DateViewWrapperRSC = async () => {
  const now = new Date();
  const monthDate = formatDate(now, "yyyy/MM");
  const workspaceId = Number(cookies().get(RECENT_W_ID_KEY)?.value) ?? 0;

  const data = await api.entries.getByMonth.query({ workspaceId, monthDate });

  return <LazyDynamicDateView initialData={data} workspaceId={workspaceId} />;
};
