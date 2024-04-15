import { createId } from "@paralleldrive/cuid2";
import { formatDate } from "date-fns";
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
      monthDate: formatDate(new Date(), "yyyy/MM"),
      trackedAt: formatDate(new Date(), "yyyy/MM/dd"),
      duration,
      project: null,
    } satisfies CustomEvent;
  }

  return {
    billable: true,
    projectId: null,
    duration: 0,
    workspaceId,
    start: new Date(),
    end: new Date(),
    monthDate: "",
    description: "",
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

type ConvertTimeOptions = {
  includeSeconds?: boolean;
};
/**
 * @description Utility function to convert seconds to hours and minutes only
 * @param seconds
 * @returns
 */
export const convertTime = (seconds = 0, options?: ConvertTimeOptions) => {
  const d = Number(seconds);

  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? `${h.toString().length > 1 ? `${h}` : `${0}${h}`}` : "00";
  const mDisplay = m > 0 ? `${m.toString().length > 1 ? `${m}` : `${0}${m}`}` : "00";
  const sDisplay = s > 0 ? `${s.toString().length > 1 ? `${s}` : `${0}${s}`}` : "00";

  return `${hDisplay}:${mDisplay}${!!options?.includeSeconds ? `:${sDisplay}` : ""}`;
};
