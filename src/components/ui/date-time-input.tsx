import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, subDays } from "date-fns";
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

  const handleTimeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(form.getValues(selector) ?? Date.now());
    const [hours, minutes] = e.target.value.split(":");

    if (!hours || !minutes) return;

    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return;

    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));

    if (selector === "end" && date < new Date()) {
      form.setError(selector, {
        message: "End cannot be in the past",
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
                    onSelect={field.onChange}
                    onDayBlur={field.onBlur}
                    disabled={(date) =>
                      date < subDays(new Date(), 1) || date > addDays(new Date(), 30)
                    }
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
