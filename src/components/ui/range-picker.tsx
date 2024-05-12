import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns-tz";
import { type DateRange } from "react-day-picker";
import { cn } from "~/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export const RangePicker = ({
  open,
  onOpenChange,
  onDateChange,
  date,
  align = "center",
  disableAfter = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateChange: (date: DateRange | undefined) => void;
  date: DateRange | undefined;
  align?: "start" | "end" | "center";
  disableAfter?: boolean;
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          size={"lg"}
          className={cn(
            "w-[240px] justify-start rounded-r-none bg-tremor-background text-left font-normal dark:bg-dark-tremor-background",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(new Date(date.from), "LLL dd, y")} -{" "}
                {format(new Date(date.to), "LLL dd, y")}
              </>
            ) : (
              format(new Date(date.from), "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          initialFocus
          showOutsideDays={false}
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={2}
          {...(disableAfter && {
            disabled: {
              after: new Date(),
            },
          })}
        />
      </PopoverContent>
    </Popover>
  );
};
