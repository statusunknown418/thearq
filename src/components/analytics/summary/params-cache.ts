import { endOfWeek, format, startOfWeek } from "date-fns";
import { useQueryStates } from "nuqs";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { NOW } from "~/lib/dates";

export const analyticsParsers = {
  from: parseAsString.withDefault(format(startOfWeek(NOW), "yyyy-MM-dd")),
  to: parseAsString.withDefault(format(endOfWeek(NOW), "yyyy-MM-dd")),
};

export const analyticsParamsCache = createSearchParamsCache(analyticsParsers);

export const useAnalyticsQS = () => {
  return useQueryStates(analyticsParsers, {
    clearOnDefault: true,
  });
};
