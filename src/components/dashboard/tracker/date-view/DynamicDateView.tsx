"use client";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { addHours, format, getDay, parse, startOfDay, startOfHour, startOfWeek } from "date-fns";
import enUs from "date-fns/locale";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "~/components/ui/button";
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
        projectColor: "black",
        id: 2,
      },
    },
  ]);

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
          resizable
          enableAutoScroll
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
            event: ({ event, continuesAfter, slotEnd, continuesPrior }) => (
              <div className={cn(`bg-[${event.data.projectColor}]`)}>
                {JSON.stringify(event)}

                {!!continuesAfter && <div>Continues {continuesPrior ? "and prior" : ""}</div>}

                {slotEnd && (
                  <div>
                    Ends
                    {format(slotEnd, "HH:mm")}
                  </div>
                )}
              </div>
            ),
          }}
          showMultiDayTimes
          scrollToTime={now}
          timeslots={2}
          step={15}
          events={events}
          date={date ? new Date(date) : now}
          localizer={localizer}
          onNavigate={updateDay}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          min={addHours(startOfDay(now), 6)}
        />
      </section>
    </section>
  );
};
