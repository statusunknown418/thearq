"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { format, toDate } from "date-fns-tz";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { NOW } from "~/lib/dates";
import { useAnalyticsQS } from "~/lib/stores/analytics-store";
import { cn } from "~/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function AnalyticsRangePicker() {
  const [open, change] = React.useState(false);
  const [state, updateState] = useAnalyticsQS();

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

      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size={"lg"}
            className={cn(
              "w-[300px] justify-start rounded-r-none bg-tremor-background text-left font-normal dark:bg-dark-tremor-background",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            showOutsideDays={false}
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setQuickSelect(undefined);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

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
