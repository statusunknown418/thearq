import { createId } from "@paralleldrive/cuid2";
import { formatDate, getWeek } from "date-fns";
import { type User } from "next-auth";
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
) => {
  if (variant === "temporal") {
    const user = auth!;
    const rangeStart = end ?? new Date();
    const rangeEnd = start ?? new Date(rangeStart.getTime() + 1000 * 60 * 60);

    if (!user) {
      return null;
    }

    return {
      billable: true,
      temp: true,
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
      duration: (rangeEnd.getTime() - rangeStart.getTime()) / 1000,
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
