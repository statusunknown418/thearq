"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { addHours, getDay, getMonth, parse, startOfDay, startOfWeek } from "date-fns";
import { format, fromZonedTime } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type SlotInfo } from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { PiTrendDown, PiTrendUp } from "react-icons/pi";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useAuthStore } from "~/lib/stores/auth-store";
import { useCommandsStore } from "~/lib/stores/commands-store";
import {
  toNextDay,
  toPrevDay,
  useDynamicMonthStore,
  useQueryDateState,
} from "~/lib/stores/dynamic-dates-store";
import { createFakeEvent, useEventsStore } from "~/lib/stores/events-store";
import { useHotkeys } from "~/lib/use-hotkeys";
import { cn } from "~/lib/utils";
import { type CustomEvent } from "~/server/api/routers/entries";
import { api } from "~/trpc/react";
import { RealtimeCounter } from "./RealtimeCounter";
import { NOW, computeDuration, convertTime, dateToMonthDate } from "~/lib/dates";
import { Skeleton } from "~/components/ui/skeleton";

const locales = {
  en: enUS,
};

const DnDCalendar = withDragAndDrop<CustomEvent>(Calendar);

export const DynamicDateView = ({
  workspaceId,
  monthDate,
  location,
}: {
  workspaceId: number;
  monthDate: string;
  location: string;
}) => {
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const auth = useAuthStore((s) => s.user);
  const [date, update] = useQueryDateState();

  const [allowSelection] = useState(true);

  const openTracker = useCommandsStore((s) => s.setCommand);
  const setTrackerValues = useCommandsStore((s) => s.setDefaultValues);

  const month = useDynamicMonthStore((s) => s.month);
  const setMonth = useDynamicMonthStore((s) => s.setMonth);

  const temporalEvents = useEventsStore((s) => s.temporalEvents);
  const setTemporalEvents = useEventsStore((s) => s.setTemporalEvents);

  const updateDay = (newDate: Date) => {
    const isToday = format(newDate, "yyyy/MM/dd") === format(NOW, "yyy/MM/dd");

    if (isToday) {
      return update(null);
    }

    if (getMonth(newDate) !== getMonth(NOW)) {
      setMonth(newDate);
    }

    void update(format(newDate, "yyyy/MM/dd"));
  };

  const utils = api.useUtils();
  const { data: events } = api.entries.getByMonth.useQuery(
    { workspaceId, monthDate: dateToMonthDate(month) },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const { mutate } = api.tracker.update.useMutation({
    onMutate: async (input) => {
      await utils.entries.getByMonth.cancel();
      const prev = utils.entries.getByMonth.getData({ workspaceId, monthDate });

      if (!prev || !auth) return;

      const updatedEvent = {
        ...prev.find((e) => e.id === input.id)!,
        ...input,
        integrationProvider: null,
      };

      utils.entries.getByMonth.setData({ workspaceId, monthDate }, (prevState) => {
        if (!prevState) return [];

        return [...prevState.filter((e) => e.id !== updatedEvent.id), updatedEvent];
      });

      return () => utils.entries.getByMonth.setData({ workspaceId, monthDate }, prev);
    },
    onSettled: () => {
      return utils.entries.getByMonth.invalidate({
        workspaceId,
        monthDate,
      });
    },
    onError: (error, _variables, rollback) => {
      toast.error("Something happened, please try again!", {
        description: error.message,
      });

      if (rollback) {
        rollback();
      }
    },
    onSuccess: () => {
      void utils.entries.getSummary.invalidate();
    },
  });

  const onSelectingTimeSlots = () => {
    if (!allowSelection) return false;

    return true;
  };

  const onDragFromSlot = useCallback(
    (range: SlotInfo) => {
      if (!range.end) return false;

      openTracker("auto-tracker");

      if (!auth) {
        return toast.error("You need to be logged in!");
      }

      const fakeEvent = createFakeEvent("temporal", {
        auth,
        start: range.start,
        end: range.end,
        workspaceId,
      });

      if (!fakeEvent) {
        toast.error("Failed to create a temporal event");
        return false;
      }

      /**
       * Set a temporal event and then delete it if the mutation is successful
       * @description assertion as CustomEvent is intentional
       */
      setTemporalEvents((prev) => prev.concat([fakeEvent as CustomEvent]));

      return true;
    },
    [auth, openTracker, setTemporalEvents, workspaceId],
  );

  const onEventResize: withDragAndDropProps<CustomEvent>["onEventResize"] = (data) => {
    const prevEvent = data.event;
    const duration = computeDuration({ start: data.start, end: data.end });

    if (!data.start || !data.end) return;

    /** Mutation */
    mutate({
      id: prevEvent.id,
      start: fromZonedTime(data.start, location),
      end: fromZonedTime(data.end, location),
      duration,
    });
  };

  const onEventDrop: withDragAndDropProps<CustomEvent>["onEventDrop"] = (data) => {
    const prevEvent = data.event;
    const duration = computeDuration({ start: data.start, end: data.end });

    /** Mutation */
    mutate({
      id: prevEvent.id,
      start: fromZonedTime(data.start, location),
      end: fromZonedTime(data.end, location),
      duration,
    });
  };

  const onSelectEvent = (e: CustomEvent) => {
    if (e.temp) return;

    openTracker("auto-tracker");

    setTrackerValues(e);
  };

  useHotkeys([
    [
      "L",
      () => {
        void update(toNextDay);
      },
    ],
    [
      "H",
      () => {
        void update(toPrevDay);
      },
    ],
    [
      "T",
      () => {
        setMonth(NOW);
        void update(null);
      },
    ],
  ]);

  useEffect(() => {
    setMonth(new Date(date ?? NOW));
  }, [date, setMonth]);

  const percentageChange = useMemo(() => {
    const today = fromZonedTime(new Date(date ?? NOW), location);
    const start = fromZonedTime(startOfDay(today), location);
    const endOfToday = fromZonedTime(addHours(start, 24), location);

    const yesterday = fromZonedTime(addHours(start, -24), location);
    const end = fromZonedTime(startOfDay(yesterday), location);

    const totalForToday = events
      ?.filter((e) => e.start >= start && e.start < endOfToday)
      .reduce((acc, curr) => acc + computeDuration({ start: curr.start, end: curr.end }), 0);

    const totalForYesterday = events
      ?.filter((e) => e.start >= end && e.start < start)
      .reduce((acc, curr) => acc + computeDuration({ start: curr.start, end: curr.end }), 0);

    if (!totalForToday && !totalForYesterday) return null;

    if (!totalForYesterday) return 100;

    return (((totalForToday ?? 0) - totalForYesterday) / totalForYesterday) * 100;
  }, [date, location, events]);

  if (!events) {
    return (
      <div className="h-h-[calc(100vh-150px)] flex min-w-[340px] flex-col  gap-4">
        <Skeleton className="h-10 w-full" />

        <Skeleton className="h-full w-full flex-grow" />
      </div>
    );
  }

  return (
    <section className="rounded-xl">
      <section className="h-[calc(100vh-150px)] w-[340px]">
        <DnDCalendar
          className="text-xs"
          defaultView="day"
          components={{
            toolbar: ({ date, label, onNavigate, localizer }) => {
              return (
                <ul className="mb-4 flex items-center gap-0.5">
                  <li>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => onNavigate("PREV")}
                            variant={"secondary"}
                            size={"icon"}
                          >
                            <ArrowLeftIcon />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                          Previous day <KBD>H</KBD>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>

                  <li>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={"ghost"}
                            onClick={() => {
                              setMonth(new Date());
                              onNavigate("TODAY");
                            }}
                            className={cn("min-w-24")}
                          >
                            {format(date, "yyyy/MM/dd") === format(NOW, "yyyy/MM/dd")
                              ? localizer.messages.today
                              : label}
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                          Today <KBD>T</KBD>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>

                  <li>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => onNavigate("NEXT")}
                            variant={"secondary"}
                            size={"icon"}
                          >
                            <ArrowRightIcon />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                          Next day <KBD>L</KBD>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>

                  {!!percentageChange && (
                    <Badge
                      className="ml-2"
                      variant={percentageChange > 0 ? "success" : "destructive"}
                    >
                      {percentageChange > 0 ? <PiTrendUp /> : <PiTrendDown />}
                      {percentageChange > 0 ? "+" : ""}
                      {percentageChange.toFixed(0)}%
                    </Badge>
                  )}
                </ul>
              );
            },
            event: ({ event, continuesPrior }) => {
              return (
                <section
                  className={cn(
                    "flex min-h-full w-full flex-col items-start gap-1 rounded-lg border border-primary px-3 py-2 text-foreground",
                    !event.end
                      ? "border-dashed bg-indigo-50 dark:bg-zinc-700"
                      : "bg-indigo-100 dark:border-primary/20 dark:bg-zinc-800 dark:text-foreground",
                    {
                      "!rounded-t-none": continuesPrior,
                      "pointer-events-none !rounded-b-none bg-gray-100 dark:bg-gray-800":
                        event?.temp,
                    },
                  )}
                >
                  {event.project?.name && (
                    <div
                      className={cn("flex items-center gap-1 rounded-full border px-1.5 py-0.5", {
                        "border-primary dark:border-border-contrast": !event.project.color,
                      })}
                      style={{
                        borderColor: event.project.color,
                      }}
                    >
                      <div
                        className={cn("h-3 w-3 rounded-full border", {
                          "bg-gray-600": !event.project.color,
                        })}
                        style={{ backgroundColor: event.project.color }}
                      />

                      <span
                        className={cn({
                          "text-muted-foreground": !event.project.color,
                        })}
                        style={{
                          color: event.project.color,
                        }}
                      >
                        {event.project.name}
                      </span>
                    </div>
                  )}

                  <p className="font-medium">{event.description}</p>

                  {event.end === null && <RealtimeCounter start={event.start} />}

                  {event.end && (
                    <p className="text-sm font-light">
                      {convertTime(computeDuration({ start: event.start, end: event.end }), {
                        includeSeconds: true,
                      })}
                    </p>
                  )}
                </section>
              );
            },
          }}
          formats={{
            eventTimeRangeFormat: () => {
              return "";
            },
          }}
          scrollToTime={NOW}
          timeslots={2}
          step={15}
          events={events.concat(temporalEvents)}
          date={date ? new Date(date) : NOW}
          titleAccessor={(e) => e.description}
          startAccessor={(e) => e.start}
          endAccessor={(e) => e.end ?? new Date()}
          localizer={localizer}
          onNavigate={updateDay}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          min={addHours(startOfDay(NOW), 6)}
          onSelectSlot={onDragFromSlot}
          onSelecting={onSelectingTimeSlots}
          onSelectEvent={onSelectEvent}
          resizableAccessor={(e) => {
            if (e.temp) return false;
            if (e.end === null) return false;
            if (e.locked) return false;
            return true;
          }}
          draggableAccessor={(e) => {
            if (e.temp) return false;
            if (e.end === null) return false;
            if (e.locked) return false;
            return true;
          }}
          selectable
          showMultiDayTimes
          resizable
        />
      </section>
    </section>
  );
};
