import { Suspense } from "react";
import { PiTimerDuotone } from "react-icons/pi";
import { Tracker } from "~/components/dashboard/tracker/TrackerTrigger";
import { CalendarWrapperRSC } from "~/components/dashboard/tracker/entries-wrapper";
import { Main } from "~/components/layout/Main";
import { Loader } from "~/components/ui/loader";

export default function WorkspaceTrackerPage() {
  return (
    <Main>
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <PiTimerDuotone size={30} className="text-blue-400" />
          <h1 className="text-3xl font-semibold">Tracker</h1>

          <Tracker />
        </div>

        <p className="text-muted-foreground">
          Track everything, benefit from the enabled integrations and be more productive.
        </p>
      </header>

      <Suspense fallback={<Loader />}>
        <CalendarWrapperRSC />
      </Suspense>
    </Main>
  );
}
