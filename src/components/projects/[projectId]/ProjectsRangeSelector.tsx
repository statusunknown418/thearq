"use client";

import { addDays, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { format, toDate } from "date-fns-tz";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { NOW } from "~/lib/dates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RangePicker } from "~/components/ui/range-picker";
import { useProjectsQS } from "./project-cache";

export function ProjectsRangeSelector() {
  const [open, change] = React.useState(false);
  const [state, updateState] = useProjectsQS();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: state.from ? toDate(state.from) : undefined,
    to: state.to ? toDate(state.to) : undefined,
  });

  const [quickSelect, setQuickSelect] = React.useState<string | undefined>(undefined);

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
      start = startOfWeek(toDate(NOW));
      end = endOfWeek(toDate(NOW));

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    if (v === "last-14-days") {
      start = addDays(NOW, -14);
      end = NOW;

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    if (v === "last-30-days") {
      start = addDays(NOW, -30);
      end = NOW;

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

    setQuickSelect(undefined);
    void updateState({
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
    });
  };

  const toNextWeek = () => {
    const start = addDays(toDate(state?.from ?? NOW), 7);
    const end = addDays(toDate(state?.to ?? NOW), 7);

    setQuickSelect(undefined);
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
        className="rounded-r-none dark:bg-dark-tremor-background"
        subSize={"iconMd"}
        onClick={toPrevWeek}
      >
        <PiArrowLeft size={14} />
      </Button>

      <Button
        variant="outline"
        size={"icon"}
        subSize={"iconMd"}
        className="mr-2 rounded-l-none border-l-0 dark:bg-dark-tremor-background"
        onClick={toNextWeek}
      >
        <PiArrowRight size={14} />
      </Button>

      <RangePicker open={open} onOpenChange={onOpenChange} onDateChange={setDate} date={date} />

      <Select value={quickSelect} onValueChange={onQuickSelect}>
        <SelectTrigger className="w-40 rounded-l-none border-l-0">
          <SelectValue placeholder="Select a range" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="last-7-days">This week</SelectItem>
          <SelectItem value="last-14-days">Last 2 weeks</SelectItem>
          <SelectItem value="last-30-days">Last month</SelectItem>
          <SelectItem value="month-to-date">Month to date</SelectItem>
        </SelectContent>
      </Select>
    </article>
  );
}
