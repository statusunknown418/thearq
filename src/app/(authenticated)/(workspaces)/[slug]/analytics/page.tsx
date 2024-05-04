import { Divider } from "@tremor/react";
import { headers } from "next/headers";
import { Suspense } from "react";
import { PiChartLineUp } from "react-icons/pi";
import { DetailedChartsWrapperRSC } from "~/components/analytics/detailed/detailed-charts-wrapper";
import { AnalyticsSummaryLoading } from "~/components/analytics/summary/AnalyticsSummary";
import { AnalyticsSummaryWrapperRSC } from "~/components/analytics/summary/analytics-summary-wrapper";
import { analyticsParamsCache } from "~/components/analytics/summary/params-cache";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { DatePickerWithRange } from "~/components/ui/range-picker";
import { VERCEL_REQUEST_LOCATION } from "~/lib/constants";

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: { start: string; end: string };
}) {
  analyticsParamsCache.parse(searchParams);
  const location = headers().get(VERCEL_REQUEST_LOCATION);

  return (
    <Main>
      <PageHeader>
        <Button size={"icon"} subSize={"iconLg"}>
          <PiChartLineUp size={20} />
        </Button>

        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Get insights on your personal activity</p>
        </div>

        <DatePickerWithRange location={location ?? "NO LOCATION PROVIDED"} />
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
