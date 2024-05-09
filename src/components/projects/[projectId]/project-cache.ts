import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { format } from "date-fns-tz";
import { useQueryStates } from "nuqs";
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const projectAnalyticsParsers = {
  from: parseAsString.withDefault(format(startOfMonth(addMonths(new Date(), -1)), "yyyy-MM-dd")),
  to: parseAsString.withDefault(format(endOfMonth(addMonths(new Date(), -1)), "yyyy-MM-dd")),
  tab: parseAsString.withDefault("revenue"),
};

export const projectAnalyticsParamsCache = createSearchParamsCache(projectAnalyticsParsers);

export const useProjectsQS = () => {
  return useQueryStates(projectAnalyticsParsers, {
    clearOnDefault: true,
  });
};
