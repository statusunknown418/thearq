"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import {
  addHours,
  format,
  formatDate,
  getDay,
  parse,
  startOfDay,
  startOfHour,
  startOfWeek,
} from "date-fns";
import enUs from "date-fns/locale";
import { useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer, type SlotInfo } from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "~/components/ui/button";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { useQueryDateState } from "~/lib/stores/dynamic-dates-store";
import { cn } from "~/lib/utils";
import { type CustomEvent } from "~/server/api/routers/track";

const endOfHour = (date: Date): Date => addHours(startOfHour(date), 1);
const now = new Date();
const start = endOfHour(now);
const end = addHours(start, 2);

const locales = {
  en: enUs,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const DnDCalendar = withDragAndDrop<CustomEvent>(Calendar);

export const DynamicDateView = () => {
  const [date, update] = useQueryDateState();
  const [allowSelection] = useState(true);
  const openTracker = useCommandsStore((s) => s.setTrack);

  const updateDay = (newDate: Date) => {
    const isToday = format(newDate, "yyyy/MM/dd") === format(now, "yyy/MM/dd");

    if (isToday) {
      return update(null);
    }

    void update(format(newDate, "yyyy/MM/dd"));
  };

  const [events, setEvents] = useState<CustomEvent[]>([
    {
      title: "Learn cool stuff",
      start,
      end,
      resource: "something",
      data: {
        projectColor: "#000",
        id: 1,
        locked: false,
        billable: true,
        description: "Learn cool stuff",
        duration: 120,
        end: end,
        start: start,
        projectId: 1,
        userId: "123123",
        weekNumber: 13,
        workspaceId: 1,
        trackedAt: formatDate(now, "yyyy/MM/dd"),
      },
    },
  ]);
  const [temporalEvents, setTemporalEvents] = useState<CustomEvent[]>([]);

  const onSelectingTimeSlots = () => {
    if (!allowSelection) return false;

    return true;
  };

  const onDragFromSlot = useCallback((range: SlotInfo) => {
    /**
     * Here we are waiting 250 milliseconds (use what you want) prior to firing
     * our method. Why? Because both 'click' and 'doubleClick'
     * would fire, in the event of a 'doubleClick'. By doing
     * this, the 'click' handler is overridden by the 'doubleClick'
     * action.
     */

    if (!range.end) return false;

    openTracker(true);

    setTemporalEvents((currentEvents) => [
      ...currentEvents,
      {
        title: "New Event",
        start: range.start,
        end: range.end,
        resource: "something",
        data: {
          projectColor: "#000",
          id: 1,
          locked: false,
          billable: true,
          description: "Learn cool stuff",
          duration: 120,
          end: end,
          start: start,
          projectId: 1,
          userId: "123123",
          weekNumber: 13,
          workspaceId: 1,
        },
      },
    ]);

    return true;
  }, []);

  const onEventResize: withDragAndDropProps["onEventResize"] = (data) => {
    const newEvent = data.event;

    setEvents((currentEvents) => {
      return currentEvents.map((event) => {
        if (event.title === newEvent.title) {
          return {
            ...event,
            start: new Date(data.start),
            end: new Date(data.end),
          };
        }

        return event;
      });
    });
  };

  const onEventDrop: withDragAndDropProps<CustomEvent>["onEventDrop"] = (data) => {
    const newEvent = data.event;

    setEvents((currentEvents) => {
      return currentEvents.map((event) => {
        if (event.data.id === newEvent.data.id) {
          return {
            ...event,
            start: new Date(data.start),
            end: new Date(data.end),
          };
        }

        return event;
      });
    });
  };

  return (
    <section className="rounded-xl">
      <section className="h-[calc(100vh-150px)] min-w-80 max-w-80">
        <DnDCalendar
          className="text-xs"
          defaultView="day"
          components={{
            toolbar: ({ date, label, onNavigate, localizer }) => {
              return (
                <ul className="mb-4 flex items-center gap-0.5">
                  <li>
                    <Button onClick={() => onNavigate("PREV")} variant={"secondary"} size={"icon"}>
                      <ArrowLeftIcon />
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant={"ghost"}
                      onClick={() => onNavigate("TODAY")}
                      className={cn("min-w-24")}
                    >
                      {getDay(date) === getDay(now) ? localizer.messages.today : label}
                    </Button>
                  </li>
                  <li>
                    <Button onClick={() => onNavigate("NEXT")} variant={"secondary"} size={"icon"}>
                      <ArrowRightIcon />
                    </Button>
                  </li>
                </ul>
              );
            },
            event: ({ event }) => {
              return (
                <div className={cn("h-full w-full items-start rounded-xl border bg-gray-700 p-4")}>
                  <div className="h-full w-full">
                    <p className="text-xs">{event.title}</p>
                  </div>

                  {event.data.locked && <p className="text-xs text-destructive">Locked</p>}
                </div>
              );
            },
          }}
          scrollToTime={now}
          timeslots={2}
          step={15}
          events={events.concat(temporalEvents)}
          resizableAccessor={(e) => !e.data.locked}
          draggableAccessor={(e) => !e.data.locked}
          date={date ? new Date(date) : now}
          localizer={localizer}
          onNavigate={updateDay}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          min={addHours(startOfDay(now), 6)}
          onSelectSlot={onDragFromSlot}
          onSelecting={onSelectingTimeSlots}
          onSelectEvent={() => openTracker(true)}
          selectable
          showMultiDayTimes
          resizable
        />
      </section>
    </section>
  );
};

