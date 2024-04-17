import { formatDate } from "date-fns";
import { type Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { TrackerTrigger } from "~/components/dashboard/tracker/TrackerTrigger";
import { DateViewWrapperRSC } from "~/components/dashboard/tracker/date-view/date-view-wrapper";
import { CalendarWrapperRSC } from "~/components/dashboard/tracker/entries-view/entries-wrapper";
import {
  LiveEntryWrapperLoading,
  LiveEntryWrapperRSC,
} from "~/components/dashboard/tracker/live-entry/live-entry-wrapper";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Loader } from "~/components/ui/loader";
import { LIVE_ENTRY_DURATION, RECENT_W_ID_KEY } from "~/lib/constants";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const generateMetadata = async (): Promise<Metadata> => {
  const session = await auth();
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  if (!session) {
    return {
      title: "Tracker",
    };
  }

  const liveEntry = await db.query.timeEntries.findFirst({
    where: (t, { isNull, eq, and }) =>
      and(
        eq(t.userId, session.user.id),
        eq(t.workspaceId, Number(workspaceId)),
        eq(t.duration, LIVE_ENTRY_DURATION),
        isNull(t.end),
      ),
  });

  if (!liveEntry) {
    return {
      title: "Tracker",
    };
  }

  return {
    title: `Tracking @ ${formatDate(liveEntry.start, "HH:mm")}`,
  };
};

export default function WorkspaceTrackerPage() {
  return (
    <Main>
      <PageHeader className="items-start">
        <TrackerTrigger />

        <section className="flex flex-grow gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold">Tracker</h1>

            <p className="text-muted-foreground">
              Track everything, benefit from the enabled integrations and be more productive.
            </p>
          </div>
        </section>

        <Suspense fallback={<LiveEntryWrapperLoading />}>
          <LiveEntryWrapperRSC />
        </Suspense>
      </PageHeader>

      <div className="flex w-full gap-2">
        <Suspense fallback={<Loader />}>
          <DateViewWrapperRSC />
        </Suspense>

        <Suspense fallback={<Loader />}>
          <CalendarWrapperRSC />
        </Suspense>
      </div>
    </Main>
  );
}
