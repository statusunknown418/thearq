import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { type DayPickerBase } from "react-day-picker";

export type DatePickerProps = {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  onBlur: () => void;
  disabled?: DayPickerBase["disabled"];
  formatType?: string;
  buttonClassName?: string;
  placeholder?: string;
} & DayPickerBase;

export const SingleDatePicker = ({
  date,
  onChange,
  onBlur,
  disabled,
  formatType,
  buttonClassName,
  placeholder = "Select a start date",
  ...props
}: DatePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={date ? "primary" : "secondary"} className={cn(buttonClassName)}>
          <CalendarIcon className={cn("h-4 w-4")} />
          {date ? format(date, formatType ?? "PPP") : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" className="flex min-w-max justify-center p-0">
        <Calendar
          className="w-full"
          mode="single"
          {...props}
          onSelect={onChange}
          onDayBlur={onBlur}
          disabled={disabled}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
};
