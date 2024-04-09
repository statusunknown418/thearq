"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import {
  addHours,
  format,
  getDay,
  getMonth,
  getWeek,
  parse,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import { useCallback, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, type SlotInfo } from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "sonner";
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
import { computeDuration, createFakeEvent, useEventsStore } from "~/lib/stores/events-store";
import { useHotkeys } from "~/lib/use-hotkeys";
import { cn } from "~/lib/utils";
import { type CustomEvent } from "~/server/api/routers/entries";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

const now = new Date();
const monthDate = format(now, "yyyy/MM");

const locales = {
  en: enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const DnDCalendar = withDragAndDrop<CustomEvent>(Calendar);

export const DynamicDateView = ({
  initialData,
  workspaceId,
}: {
  initialData: RouterOutputs["entries"]["getByMonth"];
  workspaceId: number;
}) => {
  const auth = useAuthStore((s) => s.user);
  const [date, update] = useQueryDateState();

  const [allowSelection] = useState(true);

  const openTracker = useCommandsStore((s) => s.setTrack);
  const setTrackerValues = useCommandsStore((s) => s.setDefaultValues);

  const month = useDynamicMonthStore((s) => s.month);
  const setMonth = useDynamicMonthStore((s) => s.setMonth);

  const temporalEvents = useEventsStore((s) => s.temporalEvents);
  const setTemporalEvents = useEventsStore((s) => s.setTemporalEvents);

  const updateDay = (newDate: Date) => {
    const isToday = format(newDate, "yyyy/MM/dd") === format(now, "yyy/MM/dd");

    if (isToday) {
      return update(null);
    }

    if (getMonth(newDate) !== getMonth(now)) {
      setMonth(newDate);
    }

    void update(format(newDate, "yyyy/MM/dd"));
  };

  const utils = api.useUtils();
  const { data: events } = api.entries.getByMonth.useQuery(
    { workspaceId, monthDate: format(month, "yyyy/MM") },
    { initialData, refetchOnWindowFocus: false, refetchOnReconnect: false },
  );

  console.log({ events });

  const { mutate } = api.entries.update.useMutation({
    onMutate: async (input) => {
      await utils.entries.getByMonth.cancel();
      const prev = utils.entries.getByMonth.getData({ workspaceId, monthDate });

      if (!prev || !auth) return;

      const updatedEvent = {
        ...prev.find((e) => e.id === input.id)!,
        ...input,
      };

      utils.entries.getByMonth.setData({ workspaceId, monthDate }, (prevState) => [
        ...prevState!.filter((e) => e.id !== input.id),
        updatedEvent,
      ]);

      return { prev };
    },
    onSettled: async () => {
      await utils.entries.getByMonth.invalidate({
        workspaceId,
        monthDate,
      });
    },
  });

  const onSelectingTimeSlots = () => {
    if (!allowSelection) return false;

    return true;
  };

  const onDragFromSlot = useCallback(
    (range: SlotInfo) => {
      if (!range.end) return false;

      openTracker(true);

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
    const weekNumber = getWeek(data.start);

    /** Mutation */
    mutate({
      id: prevEvent.id,
      start: fromZonedTime(data.start, "America/Lima"),
      end: fromZonedTime(data.end, "America/Lima"),
      duration,
      weekNumber,
    });
  };

  const onEventDrop: withDragAndDropProps<CustomEvent>["onEventDrop"] = (data) => {
    const prevEvent = data.event;
    const duration = computeDuration({ start: data.start, end: data.end });
    const weekNumber = getWeek(data.start);

    /** Mutation */
    mutate({
      id: prevEvent.id,
      start: new Date(data.start),
      end: new Date(data.end),
      duration,
      weekNumber,
    });
  };

  const onSelectEvent = (e: CustomEvent) => {
    if (e.temp) return;

    openTracker(true);
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
        setMonth(now);
        void update(null);
      },
    ],
  ]);

  useEffect(() => {
    setMonth(new Date(date ?? now));
  }, [date, setMonth]);

  return (
    <section className="rounded-xl">
      <section className="h-[calc(100vh-150px)] min-w-[360px] max-w-80">
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
                            {format(date, "yyyy/MM/dd") === format(now, "yyyy/MM/dd")
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
                </ul>
              );
            },
            event: ({ event }) => {
              return (
                <div
                  className={cn(
                    "h-full w-full items-start rounded-xl border border-gray-400 p-4",
                    event?.temp ? "pointer-events-none bg-gray-500" : "bg-gray-700",
                  )}
                >
                  <div className="h-full w-full">
                    <p className="text-xs">{event.description}</p>
                  </div>

                  {event.locked && <p className="text-xs text-destructive">Locked</p>}
                </div>
              );
            },
          }}
          scrollToTime={now}
          timeslots={2}
          step={15}
          events={events.concat(temporalEvents)}
          resizableAccessor={(e) => !e.locked || e.temp === undefined}
          draggableAccessor={(e) => !e.locked || e.temp === undefined}
          date={date ? new Date(date) : now}
          titleAccessor={(e) => e.description}
          startAccessor={(e) => e.start}
          endAccessor={(e) => e.end ?? new Date()}
          localizer={localizer}
          onNavigate={updateDay}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          min={addHours(startOfDay(now), 6)}
          onSelectSlot={onDragFromSlot}
          onSelecting={onSelectingTimeSlots}
          onSelectEvent={onSelectEvent}
          selectable
          showMultiDayTimes
          resizable
        />
      </section>
    </section>
  );
};
