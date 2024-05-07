import { CalendarIcon } from "@radix-ui/react-icons";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { format } from "date-fns-tz";
import { cn } from "~/lib/utils";
import { Calendar } from "./calendar";
import { type DateRange } from "react-day-picker";

export const RangePicker = ({
  open,
  onOpenChange,
  onDateChange,
  date,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateChange: (date: DateRange | undefined) => void;
  date: DateRange | undefined;
}) => {
  return (
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
          onSelect={onDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};
