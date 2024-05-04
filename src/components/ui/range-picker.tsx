"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, startOfMonth } from "date-fns";
import { format } from "date-fns-tz";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { useAnalyticsQS } from "~/lib/stores/analytics-store";

export const CLIENT_NOW = new Date();

export function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [open, change] = React.useState(false);
  const [state, updateState] = useAnalyticsQS();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(state.from),
    to: new Date(state.to),
  });

  console.log(state);

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
      start = startOfMonth(CLIENT_NOW);
      end = CLIENT_NOW;

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    if (v === "last-7-days") {
      start = addDays(CLIENT_NOW, -7);
      end = CLIENT_NOW;

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    if (v === "last-14-days") {
      start = addDays(CLIENT_NOW, -14);
      end = CLIENT_NOW;

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    if (v === "last-30-days") {
      start = addDays(CLIENT_NOW, -30);
      end = CLIENT_NOW;

      void updateState({
        from: format(start, "yyyy-MM-dd"),
        to: format(end, "yyyy-MM-dd"),
      });
    }

    setDate({ from: start, to: end });
  };

  return (
    <div className={cn("ml-auto flex items-center gap-0 self-start", className)}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size={"lg"}
            className={cn(
              "w-[300px] justify-start rounded-r-none bg-tremor-background  text-left font-normal dark:bg-dark-tremor-background",
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
          <SelectItem value="last-7-days">Last 7 days</SelectItem>
          <SelectItem value="last-14-days">Last 2 weeks</SelectItem>
          <SelectItem value="last-30-days">Last 30 days</SelectItem>
          <SelectItem value="month-to-date">Month to date</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
