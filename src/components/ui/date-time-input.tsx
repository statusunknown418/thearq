import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, getHours } from "date-fns";
import { useFormContext } from "react-hook-form";
import { PiWarningCircleDuotone } from "react-icons/pi";
import { cn } from "~/lib/utils";
import { type NewTimeEntry } from "~/server/db/edge-schema";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export const DateTimeInput = ({ selector }: { selector: "start" | "end" }) => {
  const form = useFormContext<NewTimeEntry>();
  const [parent] = useAutoAnimate();

  const time = form.watch(selector);

  const start = form.watch("start") ?? new Date();
  const end = form.watch("end") ?? new Date();

  const handleDateSelectPersistingTime = (date: Date | undefined) => {
    if (!date) return;

    const newDate = new Date(date);
    newDate.setHours(time ? getHours(time) : 0);
    newDate.setMinutes(time ? time.getMinutes() : 0);
    newDate.setSeconds(0);

    const start = form.getValues("start") ?? new Date();
    start.setDate(newDate.getDate());
    start.setMonth(newDate.getMonth());
    start.setSeconds(0);

    form.setValue(selector, newDate);

    const otherDate = new Date(start);
    otherDate.setHours(start ? getHours(start) : 0);
    otherDate.setMinutes(start ? start.getMinutes() : 0);
    otherDate.setSeconds(0);
    selector === "end" && form.setValue("start", otherDate);
  };

  const handleTimeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(form.getValues(selector) ?? Date.now());
    const [hours, minutes] = e.target.value.split(":");
    if (!hours || !minutes) return;

    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return;

    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    date.setSeconds(0);

    if (selector === "end" && date < start) {
      form.setError(selector, {
        message: "End cannot be before start.",
      });
    } else {
      form.clearErrors(selector);
    }

    if (selector === "start" && date > end) {
      form.setError(selector, {
        message: "Start cannot be after end.",
      });
    } else {
      form.clearErrors(selector);
    }

    form.setValue(selector, date);
  };

  return (
    <FormField
      control={form.control}
      name={selector}
      render={({ field }) => (
        <FormItem ref={parent}>
          <div className="flex items-center gap-2">
            <Input
              type="time"
              id="time"
              className="h-8 w-24"
              onBlur={field.onBlur}
              disabled={!field.value}
              onChange={handleTimeSelect}
              value={field.value ? format(field.value, "HH:mm") : ""}
            />

            {form.formState.errors[selector]?.message && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <PiWarningCircleDuotone size={20} className={cn("text-destructive")} />
                  </TooltipTrigger>

                  <TooltipContent className="text-destructive">
                    {form.formState.errors[selector]?.message}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {selector === "end" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={field.value ? "primary" : "secondary"}>
                    <CalendarIcon className={cn("h-4 w-4")} />
                    {field.value && format(field.value, "do LLL")}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="max-w-max p-0" align="start">
                  <Calendar
                    mode="single"
                    onSelect={(e) => handleDateSelectPersistingTime(e)}
                    onDayBlur={field.onBlur}
                    toMonth={addDays(new Date(), 30)}
                    selected={field.value ? new Date(field.value) : new Date()}
                    defaultMonth={field.value ? new Date(field.value) : new Date()}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};
