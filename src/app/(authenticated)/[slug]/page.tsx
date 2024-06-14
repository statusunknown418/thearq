import { Divider } from "@tremor/react";
import { Suspense } from "react";
import { UpdaterWrapperRSC } from "~/components/common/updater-wrapper";
import { DashboardRangeSelector } from "~/components/dashboard/DashboardRangeSelector";
import { dashboardCache } from "~/components/dashboard/dashboard-cache";
import {
  DetailedTableLoading,
  DetailedTableWrapperRSC,
} from "~/components/dashboard/detailed/detailed-table-wrapper";
import {
  OverviewLoading,
  OverviewWrapperRSC,
} from "~/components/dashboard/overview/overview-wrapper";
import { TotalsWrapperRSC } from "~/components/dashboard/totals/totals-wrapper";
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
  dashboardCache.parse(params);

  return (
    <Main>
      <PageHeader>
        <h1 className="text-lg font-semibold">Workspace overview</h1>

        <DashboardRangeSelector />
      </PageHeader>

      <Suspense fallback={<Loader />}>
        <TotalsWrapperRSC />
      </Suspense>

      <Divider className="my-1 text-xs">Overview charts</Divider>

      <Suspense fallback={<OverviewLoading />}>
        <OverviewWrapperRSC />
      </Suspense>

      <Suspense fallback={<DetailedTableLoading />}>
        <DetailedTableWrapperRSC />
      </Suspense>

      <Suspense>
        <UpdaterWrapperRSC slug={params.slug} />
      </Suspense>
    </Main>
  );
}
