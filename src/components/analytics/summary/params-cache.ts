import { format, startOfMonth } from "date-fns";
import { useQueryStates } from "nuqs";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { NOW } from "~/lib/dates";

export const analyticsParsers = {
  from: parseAsString.withDefault(format(startOfMonth(NOW), "yyyy-MM-dd")),
  to: parseAsString.withDefault(format(NOW, "yyyy-MM-dd")),
};

export const analyticsParamsCache = createSearchParamsCache(analyticsParsers);

export const useAnalyticsQS = () => {
  return useQueryStates(analyticsParsers, {
    clearOnDefault: true,
  });
};
