import { addMonths, startOfMonth } from "date-fns";
import { format } from "date-fns-tz";
import { useQueryStates } from "nuqs";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { NOW } from "~/lib/dates";

export const dashboardParsers = {
  from: parseAsString.withDefault(format(startOfMonth(addMonths(NOW, -1)), "yyyy-MM-dd")),
  to: parseAsString.withDefault(format(NOW, "yyyy-MM-dd")),
};

export const dashboardCache = createSearchParamsCache(dashboardParsers);

export const useDashboardQS = () => {
  return useQueryStates(dashboardParsers, {
    clearOnDefault: true,
  });
};
