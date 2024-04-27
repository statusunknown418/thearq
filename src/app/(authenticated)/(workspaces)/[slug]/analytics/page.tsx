import { Divider } from "@tremor/react";
import { Suspense } from "react";
import { PiChartLineUp } from "react-icons/pi";
import { DetailedChartsWrapperRSC } from "~/components/analytics/detailed/detailed-charts-wrapper";
import { AnalyticsSummaryWrapperRSC } from "~/components/analytics/summary/analytics-summary-wrapper";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";

export default function AnalyticsPage() {
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
      </PageHeader>

      <Suspense fallback={<Loader />}>
        <AnalyticsSummaryWrapperRSC />
      </Suspense>

      <Divider className="my-1 text-xs">Detailed chart</Divider>

      <Suspense fallback={<Loader />}>
        <DetailedChartsWrapperRSC />
      </Suspense>
    </Main>
  );
}
