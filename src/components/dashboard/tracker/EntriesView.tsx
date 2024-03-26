"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { format, getDaysInMonth } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { routes, useSafeParams } from "~/lib/navigation";
import { useHotkeys } from "~/lib/use-hotkeys";
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

  const [month, setMonth] = useState(new Date());
  const daysOfMonth = useMemo(() => getDaysInMonth(month), [month]);

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
    ["ArrowLeft", () => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))],
    ["ArrowRight", () => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))],
  ]);

  return (
    <section className="flex h-full flex-col gap-4">
      <header>
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-md border p-px">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"secondary"}
                    onClick={() =>
                      setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
                    }
                  >
                    <ArrowLeftIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <KBD>←</KBD>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={"ghost"} onClick={() => setMonth(new Date())}>
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
                    onClick={() =>
                      setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
                    }
                  >
                    <ArrowRightIcon />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <KBD>→</KBD>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="grid h-full min-w-full resize-none grid-cols-1 justify-stretch overflow-scroll rounded-lg border bg-popover text-center md:grid-cols-3 lg:grid-cols-7">
        {Array.from({ length: daysOfMonth }).map((_, i) => {
          const date = new Date();
          date.setDate(i + 3);

          return (
            <Link
              key={i}
              className="border-b p-1"
              href={routes.tracker({
                slug: params.slug,
                search: { date: format(date, "yyyy-MM-dd") },
              })}
            >
              <div className="flex h-full flex-col items-center justify-center rounded-lg p-2 transition-colors hover:bg-primary hover:text-primary-foreground">
                <div className="text-xs text-muted-foreground">{format(date, "EEEE do")}</div>

                <div className="flex flex-grow items-center justify-center text-2xl font-bold">
                  {0}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
