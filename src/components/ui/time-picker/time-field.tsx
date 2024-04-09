//time-picker.tsx
import * as React from "react";
import { createContext, forwardRef, useContext, type HTMLAttributes, type ReactNode } from "react";
import type { Options } from "timescape";
import { useTimescape, type DateType } from "timescape/react";
import { cn } from "~/lib/utils";

export type TimePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value?: Date;
  onChange: (date?: Date) => void;
  children: ReactNode;
  options?: Omit<Options, "date" | "onChangeDate">;
};
type TimePickerContextValue = ReturnType<typeof useTimescape>;
const TimePickerContext = createContext<TimePickerContextValue | null>(null);

const useTimePickerContext = (): TimePickerContextValue => {
  const context = useContext(TimePickerContext);
  if (!context) {
    throw new Error(
      "Unable to access TimePickerContext. This component should be wrapped by a TimePicker component",
    );
  }
  return context;
};

const TimePicker = forwardRef<React.ElementRef<"div">, TimePickerProps>(
  ({ value, onChange, options, className, ...props }, ref) => {
    const timePickerContext = useTimescape({
      date: new Date(value ?? ""),
      onChangeDate: onChange,
      ...options,
    });

    return (
      <TimePickerContext.Provider value={timePickerContext}>
        <div
          ref={ref}
          className={cn(
            "inline-flex h-8 w-max items-center justify-center rounded-md border bg-secondary text-sm shadow",
            "ring-offset-background focus-within:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </TimePickerContext.Provider>
    );
  },
);
TimePicker.displayName = "TimePicker";

type TimePickerSegmentProps = Omit<HTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  segment: DateType;
  inputClassName?: string;
};

const TimePickerSegment = forwardRef<React.ElementRef<"input">, TimePickerSegmentProps>(
  ({ segment, inputClassName, className, ...props }, ref) => {
    const { getInputProps } = useTimePickerContext();
    const { ref: timePickerInputRef } = getInputProps(segment);
    return (
      <div
        className={cn(
          "inline-flex h-full w-8 justify-center border border-transparent text-center text-accent-foreground transition-colors focus-within:bg-accent focus-within:ring-2 focus-within:ring-ring hover:border-primary/60",
          segment === "hours" && "rounded-l-md",
          segment === "minutes" && "rounded",
          segment === "seconds" && "rounded-r-md",
          segment === "am/pm" && "rounded-r-md",
          className,
        )}
      >
        <input
          ref={(node) => {
            if (typeof ref === "function") {
              ref(node);
            } else {
              if (ref) ref.current = node;
            }
            timePickerInputRef(node);
          }}
          className={cn(
            "inline-flex w-8 items-center justify-center text-center font-mono tabular-nums caret-transparent",
            "border-transparent bg-transparent outline-none ring-0 ring-offset-0 focus-visible:border-transparent focus-visible:ring-0",
            inputClassName,
          )}
          {...props}
        />
      </div>
    );
  },
);
TimePickerSegment.displayName = "TimePickerSegment";

type TimePickerSeparatorProps = HTMLAttributes<HTMLSpanElement>;
const TimePickerSeparator = forwardRef<React.ElementRef<"span">, TimePickerSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex max-w-max items-center px-0.5 py-1 text-center text-xs text-muted-foreground",
          className,
        )}
        {...props}
      ></span>
    );
  },
);
TimePickerSeparator.displayName = "TimePickerSeparator";

export { TimePicker, TimePickerSegment, TimePickerSeparator };
