import { startOfMonth } from "date-fns";
import { format, toDate } from "date-fns-tz";
import { useQueryStates } from "nuqs";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { NOW } from "~/lib/dates";

export const analyticsParsers = {
  from: parseAsString.withDefault(format(startOfMonth(toDate(NOW)), "yyyy-MM-dd")),
  to: parseAsString.withDefault(format(toDate(NOW), "yyyy-MM-dd")),
};

console.log(NOW, toDate(NOW));
export const analyticsParamsCache = createSearchParamsCache(analyticsParsers);

export const useAnalyticsQS = () => {
  return useQueryStates(analyticsParsers, {
    clearOnDefault: true,
  });
};
