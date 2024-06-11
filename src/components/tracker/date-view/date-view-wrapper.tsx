import { toZonedTime } from "date-fns-tz";
import { headers } from "next/headers";
import { VERCEL_REQUEST_LOCATION } from "~/lib/constants";
import { NOW, dateToMonthDate } from "~/lib/dates";
import { DynamicDateView } from "./DynamicDateView";

export const DateViewWrapperRSC = async () => {
  const location = headers().get(VERCEL_REQUEST_LOCATION);

  const monthDate = dateToMonthDate(toZonedTime(NOW, location ?? "America/Lima"));

  return <DynamicDateView monthDate={monthDate} location={location ?? "America/Lima"} />;
};
