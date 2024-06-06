"use client";

import { addMonths, addWeeks, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { format, toDate } from "date-fns-tz";
import { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";
import { PiCalendarBlankDuotone, PiCaretDownBold } from "react-icons/pi";
import { toast } from "sonner";
import { NOW } from "~/lib/dates";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { RangePicker } from "../ui/range-picker";
import { useDashboardQS } from "./dashboard-cache";

export const DashboardRangeSelector = () => {
  const [state, update] = useDashboardQS();

  const [open, setOpen] = useState(false);

  const [date, setDate] = useState<DateRange | undefined>({
    from: state.from ? toDate(state.from) : undefined,
    to: state.to ? toDate(state.to) : undefined,
  });

  const onBlurOrSelect = async () => {
    if (!date?.from && !date?.to) {
      return;
    }

    if (date.from && !date.to) {
      return toast.error("Please select a date range");
    }

    const start = date.from ? format(date.from, "yyyy-MM-dd") : undefined;
    const end = date.to ? format(date.to, "yyyy-MM-dd") : undefined;

    void update({
      from: start,
      to: end,
    });
  };

  const onOpenChange = (v: boolean) => {
    if (!v) {
      void onBlurOrSelect();
    }

    setOpen(v);
  };

  const selectLastWeek = () => {
    const start = startOfWeek(addWeeks(toDate(NOW), -1));
    const end = endOfWeek(addWeeks(toDate(NOW), -1));

    void update({
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    });
  };

  const selectLastTwoWeeks = () => {
    const start = startOfWeek(addWeeks(toDate(NOW), -2));
    const end = toDate(NOW);

    void update({
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    });
  };

  const selectLastMonth = () => {
    const start = addMonths(startOfMonth(toDate(NOW)), -1);
    const end = addMonths(endOfMonth(toDate(NOW)), -1);

    void update({
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    });
  };

  const selectMonthToDate = () => {
    const start = startOfMonth(toDate(NOW));
    const end = toDate(NOW);

    void update({
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    });
  };

  useEffect(() => {
    if (state.from && state.to) {
      setDate({
        from: toDate(state.from),
        to: toDate(state.to),
      });
    }
  }, [state.from, state.to]);

  return (
    <article className="ml-auto flex items-center gap-0 self-start">
      <RangePicker open={open} onOpenChange={onOpenChange} onDateChange={setDate} date={date} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            subSize={"iconMd"}
            className="rounded-l-none border-l-0"
          >
            <PiCaretDownBold />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onSelect={selectLastWeek}>
            <PiCalendarBlankDuotone size={15} />
            <span>Last week</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={selectLastTwoWeeks}>
            <PiCalendarBlankDuotone size={15} />
            <span>Last 2 weeks</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={selectLastMonth}>
            <PiCalendarBlankDuotone size={15} />
            <span>Last month</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={selectMonthToDate}>
            <PiCalendarBlankDuotone size={15} />

            <span>Month to date</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
};
