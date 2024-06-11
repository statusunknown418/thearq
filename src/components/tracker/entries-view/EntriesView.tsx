"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { Loader } from "~/components/ui/loader";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { dateToMonthDate } from "~/lib/dates";
import { useHotkeys } from "~/lib/hooks/use-hotkeys";
import {
  computeMonthDays,
  header,
  toNextMonthDate,
  toPrevMonthDate,
  useDynamicMonthStore,
} from "~/lib/stores/dynamic-dates-store";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { DateCell } from "./DateCell";

export const EntriesViews = ({
  initialData,
}: {
  initialData: RouterOutputs["entries"]["getSummary"];
}) => {
  const month = useDynamicMonthStore((s) => s.month);
  const setMonth = useDynamicMonthStore((s) => s.setMonth);

  const startDate = startOfMonth(month);
  const endDate = endOfMonth(month);

  const prefixDays = useMemo(() => startDate.getDay(), [startDate]);
  const suffixDays = useMemo(() => 6 - endDate.getDay(), [endDate]);

  const computedMonthGrid = useMemo(() => computeMonthDays(month), [month]);

  const { data, isLoading } = api.entries.getSummary.useQuery(
    {
      monthDate: dateToMonthDate(month),
    },
    {
      initialData,
      refetchOnWindowFocus: false,
    },
  );

  useHotkeys([
    ["K", () => setMonth(toPrevMonthDate(month))],
    ["J", () => setMonth(toNextMonthDate(month))],
  ]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="flex h-full w-full flex-col gap-4">
      <header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 rounded-md">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"secondary"}
                    size={"icon"}
                    onClick={() => setMonth(toPrevMonthDate(month))}
                  >
                    <ArrowLeftIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Previous month
                  <KBD>K</KBD>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    onClick={() => setMonth(new Date())}
                    className={cn("min-w-24")}
                  >
                    {format(month, "MMMM yyyy")}
                  </Button>
                </TooltipTrigger>

                <TooltipContent>Back to current month</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"secondary"}
                    size={"icon"}
                    onClick={() => setMonth(toNextMonthDate(month))}
                  >
                    <ArrowRightIcon />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  Next month
                  <KBD>J</KBD>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="flex h-full w-full flex-col">
        <section className="grid min-w-full grid-cols-7 rounded-t-md border-x border-t bg-muted py-1 text-muted-foreground">
          {header.map((day) => (
            <div key={day} className="flex items-center justify-center">
              <p className="text-xs">{day}</p>
            </div>
          ))}
        </section>

        <section
          className={cn(
            "grid h-full min-w-full resize-none grid-cols-1 justify-stretch overflow-scroll",
            "rounded-b-lg border-x border-b text-center last:border-r md:grid-cols-3 lg:grid-cols-7",
          )}
        >
          {Array.from({ length: prefixDays }).map((_, index) => (
            <div key={index} className="border-t p-1.5" />
          ))}

          {computedMonthGrid.map(({ date, id }) => (
            <DateCell
              key={id}
              date={date}
              entrySummary={data.hoursByDay[date.getDate()]}
              entryList={data.entriesByDate[date.getDate()]}
            />
          ))}

          {Array.from({ length: suffixDays }).map((_, index) => (
            <div key={index} className="border-t p-1.5" />
          ))}
        </section>
      </div>
    </section>
  );
};
