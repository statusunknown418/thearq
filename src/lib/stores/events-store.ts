import { createId } from "@paralleldrive/cuid2";
import { formatDate, getWeek } from "date-fns";
import { type User } from "next-auth";
import { type stringOrDate } from "react-big-calendar";
import { create } from "zustand";
import { type CustomEvent } from "~/server/api/routers/entries";
import { type NewTimeEntry } from "~/server/db/edge-schema";

export type EventsStore = {
  temporalEvents: CustomEvent[];
  setTemporalEvents: (events: CustomEvent[] | ((prev: CustomEvent[]) => CustomEvent[])) => void;
  clear: () => void;
};

export const useEventsStore = create<EventsStore>((set, get) => ({
  temporalEvents: [],
  setTemporalEvents: (events) => {
    if (typeof events === "function") {
      return set({ temporalEvents: events(get().temporalEvents) });
    }
    return set({ temporalEvents: events });
  },
  clear: () => set({ temporalEvents: [] }),
}));

/** By default all fake events are billable */
export const createFakeEvent = (
  variant: "temporal" | "defaultValues",
  {
    auth,
    start = new Date(),
    end,
    workspaceId = 0,
  }: {
    auth?: User;
    start?: Date;
    end: Date | null;
    workspaceId?: number;
  },
  isQueryData?: boolean,
) => {
  if (variant === "temporal") {
    const overrideTemporal = variant === "temporal" && !isQueryData ? true : false;
    const user = auth!;
    const rangeStart = start ?? new Date();
    const rangeEnd = end ?? new Date(rangeStart.getTime() + 1000 * 60 * 60);

    const duration = computeDuration({ start: rangeStart, end: rangeEnd });

    if (!user) {
      return null;
    }

    return {
      billable: true,
      temp: overrideTemporal,
      locked: true,
      id: Math.random() * 10000,
      start,
      end,
      user: {
        emailVerified: null,
        email: user.email ?? "",
        id: user.id ?? createId(),
        image: user.image ?? null,
        name: user.name ?? null,
      },
      workspaceId,
      projectId: 0,
      description: "",
      integrationUrl: null,
      userId: user.id ?? createId(),
      monthDate: "",
      trackedAt: formatDate(new Date(), "yyyy/MM/dd"),
      weekNumber: getWeek(rangeStart),
      duration,
      project: {
        color: "#000",
        identifier: "PRX",
        name: "ProjectX",
      },
    } satisfies CustomEvent;
  }

  return {
    billable: true,
    duration: 0,
    start: new Date(),
    end: new Date(),
    weekNumber: 0,
    monthDate: "",
    workspaceId: 0,
    description: "",
    projectId: 0,
  } satisfies NewTimeEntry;
};

/**
 * @description Simple function to calculate the duration of an event
 * @param start Range start
 * @param end Range end
 * @returns Returns `-1` if there's no end set so the DB can know that as well
 */
export const computeDuration = ({
  start,
  end,
}: {
  start: stringOrDate;
  end: stringOrDate | null;
}) => {
  return end ? (new Date(end).getTime() - new Date(start).getTime()) / 1000 : -1;
};