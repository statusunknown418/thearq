import { addMonths, startOfMonth } from "date-fns";
import { format, toDate } from "date-fns-tz";
import { useQueryStates } from "nuqs";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { NOW } from "~/lib/dates";

export const projectAnalyticsParsers = {
  from: parseAsString.withDefault(format(startOfMonth(addMonths(NOW, -1)), "yyyy/MM/dd")),
  to: parseAsString.withDefault(format(NOW, "yyyy-MM-dd")),
  tab: parseAsString.withDefault("revenue"),
  view: parseAsString.withDefault("day"),
};

console.log(NOW, toDate(NOW));
export const projectAnalyticsParamsCache = createSearchParamsCache(projectAnalyticsParsers);

export const useProjectsQS = () => {
  return useQueryStates(projectAnalyticsParsers, {
    clearOnDefault: true,
  });
};
