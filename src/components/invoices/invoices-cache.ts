import { parseAsArrayOf, parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const steps = ["general", "items", "notes"] as const;

export const invoiceParses = {
  step: parseAsStringLiteral(steps).withDefault("general"),
  client: parseAsInteger,
  projects: parseAsArrayOf(parseAsInteger).withDefault([]),
};

export const invoiceParamsCache = createSearchParamsCache(invoiceParses);

export const useInvoicesQS = () => {
  return useQueryStates(invoiceParses, {
    clearOnDefault: true,
  });
};
