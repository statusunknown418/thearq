"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import * as React from "react";
import { type DateRange } from "react-day-picker";

import { PiCalendarBlank } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  return (
    <div
      className={cn("ml-auto flex items-center gap-0 self-start bg-tremor-background", className)}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size={"lg"}
            className={cn(
              "w-[280px] justify-start rounded-r-none text-left font-normal",
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
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} size={"lg"} className="w-[120px] rounded-l-none border-l-0">
            Select
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem>
            <PiCalendarBlank />
            Last 7 days
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PiCalendarBlank />
            Last 2 weeks
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PiCalendarBlank />
            Last 30 days
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PiCalendarBlank />
            Month to date
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
