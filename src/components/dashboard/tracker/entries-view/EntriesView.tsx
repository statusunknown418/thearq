"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useSafeParams, useSafeSearchParams } from "~/lib/navigation";
import {
  computeMonthDays,
  toNextDay,
  toNextMonthDate,
  toNow,
  toPrevDay,
  toPrevMonthDate,
  useQueryDateState,
} from "~/lib/stores/dynamic-dates-store";
import { useHotkeys } from "~/lib/use-hotkeys";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const EntriesViews = ({
  workspaceId,
  initialData,
}: {
  workspaceId: number;
  initialData: RouterOutputs["logsHistory"]["get"];
}) => {
  const params = useSafeParams("dashboard");
  const search = useSafeSearchParams("tracker");

  const [month, setMonth] = useState(new Date());
  const [_, setQueryDate] = useQueryDateState();

  const computedMonthGrid = useMemo(() => computeMonthDays(month), [month]);

  const [data] = api.logsHistory.get.useSuspenseQuery(
    {
      workspaceId,
      date: new Date(),
    },
    {
      initialData,
    },
  );

  useHotkeys([
    ["ArrowUp", () => setMonth(toNextMonthDate)],
    ["ArrowDown", () => setMonth(toPrevMonthDate)],
    ["ArrowLeft", () => setQueryDate(toPrevDay)],
    ["ArrowRight", () => setQueryDate(toNextDay)],
  ]);

  return (
    <section className="flex h-full flex-col gap-4">
      <header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 rounded-md">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"secondary"}
                    size={"icon"}
                    onClick={() => setMonth(toPrevMonthDate)}
                  >
                    <ArrowLeftIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <KBD>↓</KBD>
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
                    onClick={() => setMonth(toNextMonthDate)}
                  >
                    <ArrowRightIcon />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <KBD>↑</KBD>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="grid h-full min-w-full resize-none grid-cols-1 justify-stretch overflow-scroll rounded-lg border bg-popover text-center md:grid-cols-3 lg:grid-cols-7">
        {computedMonthGrid.map(({ date, id }) => (
          <div
            key={id}
            onClick={() => {
              if (format(date, "yyyy/MM/dd") === toNow()) {
                return setQueryDate(null);
              }

              void setQueryDate(format(date, "yyyy/MM/dd"));
            }}
            className={cn(
              "flex h-full flex-col items-center justify-center rounded-lg p-2 transition-colors hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <div className="text-xs text-muted-foreground">{format(date, "EEEE do")}</div>

            <div className="flex flex-grow items-center justify-center text-2xl font-bold">0</div>
          </div>
        ))}
      </div>
    </section>
  );
};
