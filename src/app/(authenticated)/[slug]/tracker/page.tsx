import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { TrackerTrigger } from "~/components/tracker/TrackerTrigger";
import {
  LiveEntryWrapperLoading,
  LiveEntryWrapperRSC,
} from "~/components/tracker/live-entry/live-entry-wrapper";
import { Loader } from "~/components/ui/loader";
import { Skeleton } from "~/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Tracker",
};

const LazyDynamicDateViewWrapperRSC = dynamic(() =>
  import("~/components/tracker/date-view/date-view-wrapper").then((mod) => mod.DateViewWrapperRSC),
);

const LazCalendarWrapperRSC = dynamic(() =>
  import("~/components/tracker/entries-view/entries-wrapper").then((mod) => mod.CalendarWrapperRSC),
);

export default function WorkspaceTrackerPage() {
  return (
    <Main>
      <PageHeader>
        <section className="flex flex-grow items-center gap-3">
          <TrackerTrigger />

          <h1 className="text-lg font-semibold">Tracker</h1>
        </section>

        <Suspense fallback={<LiveEntryWrapperLoading />}>
          <LiveEntryWrapperRSC />
        </Suspense>
      </PageHeader>

      <div className="flex w-full gap-2">
        <Suspense
          fallback={
            <div className="h-h-[calc(100vh-150px)] flex min-w-[340px] flex-col gap-4">
              <Skeleton className="h-10 w-full" />

              <Skeleton className="h-full w-full flex-grow" />
            </div>
          }
        >
          <LazyDynamicDateViewWrapperRSC />
        </Suspense>

        <Suspense fallback={<Loader />}>
          <LazCalendarWrapperRSC />
        </Suspense>
      </div>
    </Main>
  );
}
