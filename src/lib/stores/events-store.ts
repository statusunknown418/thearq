import { createId } from "@paralleldrive/cuid2";
import { type User } from "next-auth";
import { create } from "zustand";
import { type CustomEvent } from "~/server/api/routers/entries";
import { type NewTimeEntry } from "~/server/db/edge-schema";
import { computeDuration, dateToMonthDate } from "../dates";

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
    workspaceId,
  }: {
    auth?: User;
    start?: Date;
    end: Date | null;
    workspaceId: number;
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
      projectId: null,
      integrationUrl: null,
      integrationProvider: null,
      workspaceId,
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
      description: "",
      userId: user.id ?? createId(),
      monthDate: dateToMonthDate(new Date()),
      trackedAt: new Date(),
      duration,
      project: null,
      invoiceId: null,
    } satisfies CustomEvent;
  }

  return {
    billable: true,
    projectId: null,
    duration: 0,
    start: new Date(),
    end: new Date(),
    monthDate: "",
    description: "",
    workspaceId,
  } satisfies NewTimeEntry;
};
