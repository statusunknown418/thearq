"use client";

import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { format, toDate } from "date-fns-tz";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import { PiArrowLeft, PiArrowRight, PiCalendarBlankDuotone, PiCaretDownBold } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { RangePicker } from "~/components/ui/range-picker";
import { NOW, adjustEndDate } from "~/lib/dates";
import { useProjectsQS } from "./project-cache";

export function ProjectsRangeSelector() {
  const [open, change] = React.useState(false);
  const [state, updateState] = useProjectsQS();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: state.from ? toDate(state.from) : undefined,
    to: state.to ? toDate(state.to) : undefined,
  });

  const onOpenChange = (v: boolean) => {
    if (!v) {
      void onBlurOrSelect();
    }

    change(v);
  };

  const onBlurOrSelect = async () => {
    if (!date?.from && !date?.to) {
      return;
    }

    if (date.from && !date.to) {
      return toast.error("Please select a date range");
    }

    const start = date.from ? format(date.from, "yyyy-MM-dd") : undefined;
    const end = date.to ? format(date.to, "yyyy-MM-dd") : undefined;

    void updateState({
      from: start,
      to: end,
    });
  };

  const onQuickSelect = (v: string) => {
    let start: Date | undefined;
    let end: Date | undefined;

    if (v === "month-to-date") {
      start = startOfMonth(NOW);
      end = NOW;

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    if (v === "last-7-days") {
      start = startOfWeek(addWeeks(toDate(NOW), -1));
      end = endOfWeek(addWeeks(toDate(NOW), -1));

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    if (v === "last-month") {
      start = addMonths(startOfMonth(NOW), -1);
      end = adjustEndDate(addMonths(endOfMonth(NOW), -1));

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    if (v === "last-quarter") {
      start = addQuarters(startOfMonth(NOW), -1);
      end = adjustEndDate(addQuarters(endOfMonth(NOW), -1));

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    setDate({ from: start, to: end });
  };

  const toPrevWeek = () => {
    const start = addDays(toDate(state?.from ?? NOW), -7);
    const end = addDays(toDate(state?.to ?? NOW), -7);

    void updateState({
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    });
  };

  const toNextWeek = () => {
    const start = addDays(toDate(state?.from ?? NOW), 7);
    const end = addDays(toDate(state?.to ?? NOW), 7);

    void updateState({
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    });
  };

  React.useEffect(() => {
    if (state.from && state.to) {
      setDate({
        from: toDate(state.from),
        to: toDate(state.to),
      });
    }
  }, [state.from, state.to]);

  return (
    <article className="ml-auto flex items-center gap-0 self-start">
      <Button
        variant="outline"
        size={"icon"}
        subSize={"iconBase"}
        className="rounded-r-none"
        onClick={toPrevWeek}
      >
        <PiArrowLeft size={13} />
      </Button>

      <Button
        variant="outline"
        size={"icon"}
        subSize={"iconBase"}
        className="mr-2 rounded-l-none border-l-0"
        onClick={toNextWeek}
      >
        <PiArrowRight size={13} />
      </Button>

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
          <DropdownMenuItem onSelect={() => onQuickSelect("last-7-days")}>
            <PiCalendarBlankDuotone size={15} />
            <span>Last week</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => onQuickSelect("last-month")}>
            <PiCalendarBlankDuotone size={15} />
            <span>Last month</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => onQuickSelect("last-quarter")}>
            <PiCalendarBlankDuotone size={15} />
            <span>Last quarter</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => onQuickSelect("month-to-date")}>
            <PiCalendarBlankDuotone size={15} />

            <span>Month to date</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
}
