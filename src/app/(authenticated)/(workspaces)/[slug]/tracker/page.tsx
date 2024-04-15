import { Suspense } from "react";
import { TrackerTrigger } from "~/components/dashboard/tracker/TrackerTrigger";
import { DateViewWrapperRSC } from "~/components/dashboard/tracker/date-view/date-view-wrapper";
import { CalendarWrapperRSC } from "~/components/dashboard/tracker/entries-view/entries-wrapper";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Loader } from "~/components/ui/loader";

export default function WorkspaceTrackerPage() {
  return (
    <Main>
      <PageHeader>
        <TrackerTrigger />

        <section className="flex gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold">Tracker</h1>

            <p className="text-muted-foreground">
              Track everything, benefit from the enabled integrations and be more productive.
            </p>
          </div>
        </section>
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
