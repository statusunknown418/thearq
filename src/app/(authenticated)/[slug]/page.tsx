import { Suspense } from "react";
import { UpdaterWrapperRSC } from "~/components/common/updater-wrapper";
import { TotalsWrapperRSC } from "~/components/dashboard/totals-wrapper";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Loader } from "~/components/ui/loader";

export default function WorkspaceDashboardPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  return (
    <Main>
      <PageHeader>
        <div>
          <h1 className="text-xl font-bold">Workspace Dashboard</h1>
          <p className="text-muted-foreground">
            The most important metrics for your workspace, all in one place, at a glance.
          </p>
        </div>
      </PageHeader>

      <Suspense fallback={<Loader />}>
        <TotalsWrapperRSC />
      </Suspense>

      <Suspense>
        <UpdaterWrapperRSC slug={params.slug} />
      </Suspense>
    </Main>
  );
}
