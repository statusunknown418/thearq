import { endOfWeek, format, startOfWeek } from "date-fns";
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
      from: parseAsString.withDefault(
        format(
          startOfWeek(NOW, {
            weekStartsOn: 1,
          }),
          "yyyy-MM-dd",
        ),
      ),
      to: parseAsString.withDefault(format(endOfWeek(NOW, { weekStartsOn: 1 }), "yyyy-MM-dd")),
    },
    {
      clearOnDefault: true,
    },
  );
};
