import { format, getDaysInMonth } from "date-fns";
import { createParser, useQueryState } from "nuqs";
import { create } from "zustand";

export type DynamicDatesStore = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

export const useDynamicDatesStore = create<DynamicDatesStore>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));

export const useQueryDateState = () => {
  return useQueryState("date", { history: "push" });
};

export const computeMonthDays = (base: string | Date) => {
  const dateFromBase = new Date(base);
  const daysOfMonth = getDaysInMonth(dateFromBase);

  return Array.from({ length: daysOfMonth }).map((_, i) => {
    const date = new Date(dateFromBase.getFullYear(), dateFromBase.getMonth(), i + 1);

    return {
      date,
      id: date.getTime(),
    };
  });
};

export const parseAsFormattedMonth = createParser({
  parse(value) {
    const date = new Date(value);
    const formatted = format(date, "yyyy-MM");
    return formatted;
  },
  serialize(value) {
    return value;
  },
});

export const getMonthFromBase = (base: string) => {
  const [year, month] = base.split("-");

  /** The +1 is because the second arg is the INDEX of the month not its position */
  return new Date(Number(year), Number(month));
};

export const toNextMonth = (base: string) => {
  const date = getMonthFromBase(base);
  const next = new Date(date.getFullYear(), date.getMonth() + 1);

  return format(next, "yyyy-MM");
};

export const toPrevMonth = (base: string) => {
  const date = getMonthFromBase(base);
  const prev = new Date(date.getFullYear(), date.getMonth() - 1);

  return format(prev, "yyyy-MM");
};

export const toNow = () => format(new Date(), "yyyy-MM");

export const toNextMonthDate = (base: Date) => {
  const next = new Date(base.getFullYear(), base.getMonth() + 1);

  return next;
};

export const toPrevMonthDate = (base: Date) => {
  const prev = new Date(base.getFullYear(), base.getMonth() - 1);

  return prev;
};
