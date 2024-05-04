import { endOfWeek, format, startOfWeek } from "date-fns";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { NOW } from "~/lib/dates";

export const analyticsParsers = {
  from: parseAsString.withDefault(format(startOfWeek(NOW, { weekStartsOn: 1 }), "yyyy-MM-dd")),
  to: parseAsString.withDefault(format(endOfWeek(NOW, { weekStartsOn: 1 }), "yyyy-MM-dd")),
};

export const analyticsParamsCache = createSearchParamsCache(analyticsParsers);
