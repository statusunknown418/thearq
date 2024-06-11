import { Divider } from "@tremor/react";
import { Suspense } from "react";
import { PiChartBarDuotone,  } from "react-icons/pi";
import { AnalyticsRangeSelector } from "~/components/analytics/AnalyticsRangeSelector";
import { DetailedChartsWrapperRSC } from "~/components/analytics/detailed/detailed-charts-wrapper";
import { AnalyticsSummaryLoading } from "~/components/analytics/summary/AnalyticsSummary";
import { AnalyticsSummaryWrapperRSC } from "~/components/analytics/summary/analytics-summary-wrapper";
import { analyticsParamsCache } from "~/components/analytics/summary/params-cache";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Loader } from "~/components/ui/loader";

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: { start: string; end: string };
}) {
  analyticsParamsCache.parse(searchParams);

  return (
    <Main>
      <PageHeader>
        <PiChartBarDuotone size={22} className="text-indigo-500" />

        <h1 className="text-lg font-semibold">Analytics</h1>

        <AnalyticsRangeSelector />
      </PageHeader>

      <Suspense fallback={<AnalyticsSummaryLoading />}>
        <AnalyticsSummaryWrapperRSC />
      </Suspense>

      <Divider className="my-1 text-xs">Detailed chart</Divider>

      <Suspense fallback={<Loader />}>
        <DetailedChartsWrapperRSC />
      </Suspense>
    </Main>
  );
}
