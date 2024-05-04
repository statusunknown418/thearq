import { cookies, headers } from "next/headers";
import { RECENT_W_ID_KEY, VERCEL_REQUEST_LOCATION } from "~/lib/constants";
import { DynamicDateView } from "./DynamicDateView";
import { NOW, dateToMonthDate } from "~/lib/dates";
import { api } from "~/trpc/server";
import { toZonedTime } from "date-fns-tz";

export const DateViewWrapperRSC = async () => {
  const workspaceId = Number(cookies().get(RECENT_W_ID_KEY)?.value) ?? 0;
  const location = headers().get(VERCEL_REQUEST_LOCATION);

  const monthDate = dateToMonthDate(toZonedTime(NOW, location ?? "America/Lima"));
  const data = await api.entries.getByMonth.query({
    workspaceId,
    monthDate,
  });

  return (
    <DynamicDateView
      workspaceId={workspaceId}
      monthDate={monthDate}
      initialData={data}
      location={location ?? "NO_LOCATION_ERROR"}
    />
  );
};
