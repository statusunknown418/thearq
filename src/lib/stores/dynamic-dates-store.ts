import { addDays, format, getDaysInMonth } from "date-fns";
import { createParser, useQueryState } from "nuqs";
import { create } from "zustand";
import { dateToMonthDate } from "../dates";

export type DynamicDatesStore = {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  reset: () => void;
};

export type DynamicMonthStore = {
  month: Date;
  setMonth: (month: Date) => void;
};

export const header = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const useDynamicDatesStore = create<DynamicDatesStore>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  reset: () => set({ selectedDate: null }),
}));

export const useDynamicMonthStore = create<DynamicMonthStore>((set) => ({
  month: new Date(),
  setMonth: (month) => set({ month }),
}));

export const useQueryDateState = () => {
  return useQueryState("date");
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
  const [year, month, day] = base.split("/");

  return new Date(Number(year), Number(month) - 1, Number(day));
};

export const toNextDay = (base: string | null) => {
  const date = !!base ? getMonthFromBase(base) : new Date();
  const next = addDays(date, 1);

  return format(next, "yyyy/MM/dd");
};

export const toPrevDay = (base: string | null) => {
  const date = !!base ? getMonthFromBase(base) : new Date();
  const prev = addDays(date, -1);

  return format(prev, "yyyy/MM/dd");
};

export const toNow = () => format(new Date(), "yyyy/MM/dd");

export const toNextMonthDate = (base: Date) => {
  const next = new Date(base.getFullYear(), base.getMonth() + 1);

  return next;
};

export const toPrevMonthDate = (base: Date) => {
  const prev = new Date(base.getFullYear(), base.getMonth() - 1);

  return prev;
};

export const toGenericMonth = (base: Date) => {
  return dateToMonthDate(base);
};
