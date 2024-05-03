import {
  addBusinessDays,
  addMonths,
  addWeeks,
  differenceInDays,
  format,
  formatDistance,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { type stringOrDate } from "react-big-calendar";
import { type GlobalPaymentSchedule } from "~/server/db/edge-schema";

export const NOW = new Date();

/**
 * @description Simple function to calculate the duration of an event
 * @param start Range start
 * @param end Range end
 * @returns Returns `-1` if there's no end set so the DB can know that as well
 */
export const computeDuration = ({
  start,
  end,
}: {
  start: stringOrDate;
  end: stringOrDate | null;
}) => {
  return end ? (new Date(end).getTime() - new Date(start).getTime()) / 1000 : -1;
};

type ConvertTimeOptions = {
  includeSeconds?: boolean;
};
/**
 * @description Utility function to convert seconds to hours and minutes only
 * @param seconds
 * @returns
 */
export const convertTime = (seconds = 0, options?: ConvertTimeOptions) => {
  const d = Number(seconds);

  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? `${h.toString().length > 1 ? `${h}` : `${0}${h}`}` : "00";
  const mDisplay = m > 0 ? `${m.toString().length > 1 ? `${m}` : `${0}${m}`}` : "00";
  const sDisplay = s > 0 ? `${s.toString().length > 1 ? `${s}` : `${0}${s}`}` : "00";

  return `${hDisplay}:${mDisplay}${!!options?.includeSeconds ? `:${sDisplay}` : ""}`;
};

export const secondsToHoursDecimal = (seconds: number) => {
  return seconds / 3600;
};

/**
 * Standard way to turn the date format to `yyyy/MM`
 * @param date
 * @returns
 */
export const dateToMonthDate = (date: Date) => {
  return format(date, "yyyy/MM");
};

/**
 * @description Utility function to convert the payment schedule to a human readable date
 * @param schedule
 * @returns
 */
export const paymentScheduleToDate = (schedule: GlobalPaymentSchedule) => {
  if (schedule === "monthly") {
    const date = new Date();
    const toNextMonth = startOfMonth(addMonths(date, 1));
    const difference = differenceInDays(toNextMonth, date);
    return { format: formatDistance(toNextMonth, date), difference };
  }

  if (schedule === "weekly") {
    const weekDate = new Date();
    const toNextWeek = startOfWeek(addWeeks(weekDate, 1));
    const difference = differenceInDays(toNextWeek, weekDate);
    return { format: formatDistance(toNextWeek, weekDate), difference };
  }

  if (schedule === "bi-monthly") {
    // Needs fix
    const biMonthDate = new Date();
    const toNextBiMonth = addBusinessDays(biMonthDate, 10);
    const difference = differenceInDays(toNextBiMonth, biMonthDate);
    return { format: formatDistance(toNextBiMonth, biMonthDate), difference };
  }

  return { format: "Unknown", difference: 0 };
};
