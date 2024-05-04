import { useQueryStates } from "nuqs";
import { create } from "zustand";
import { analyticsParsers } from "~/components/analytics/summary/params-cache";

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
  return useQueryStates(analyticsParsers, {
    clearOnDefault: true,
  });
};
