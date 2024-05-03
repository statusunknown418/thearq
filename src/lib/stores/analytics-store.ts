import { format, startOfMonth } from "date-fns";
import { parseAsString, useQueryStates } from "nuqs";
import { create } from "zustand";
import { NOW } from "../dates";

export type AnalyticsStore = {
  start: string | undefined;
  end: string | undefined;
  update: (start: string | undefined, end: string | undefined) => void;
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  start: undefined,
  end: undefined,
  update: (start, end) => set({ start, end }),
}));

export const useAnalyticsQS = () => {
  return useQueryStates(
    {
      from: parseAsString.withDefault(format(startOfMonth(NOW), "yyyy-MM-dd")),
      to: parseAsString.withDefault(format(NOW, "yyyy-MM-dd")),
    },
    {
      clearOnDefault: true,
    },
  );
};
