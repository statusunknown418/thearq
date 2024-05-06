import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const projectAnalyticsParsers = {
  from: parseAsString,
  to: parseAsString,
};

export const projectAnalyticsParamsCache = createSearchParamsCache(projectAnalyticsParsers);
