import { addDays } from "date-fns";
import { format } from "date-fns-tz";
import { useQueryStates } from "nuqs";
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const projectAnalyticsParsers = {
  from: parseAsString.withDefault(format(addDays(new Date(), -30), "yyyy-MM-dd")),
  to: parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
};

export const projectAnalyticsParamsCache = createSearchParamsCache(projectAnalyticsParsers);

export const useProjectsQS = () => {
  return useQueryStates(projectAnalyticsParsers, {
    clearOnDefault: true,
  });
};
