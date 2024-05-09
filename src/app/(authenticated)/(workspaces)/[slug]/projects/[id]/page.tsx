import { Suspense } from "react";
import { Main } from "~/components/layout/Main";
import { ProjectMainTabs } from "~/components/projects/[projectId]/ProjectMainTabs";
import { projectAnalyticsParamsCache } from "~/components/projects/[projectId]/project-cache";
import { ProjectClientDetailsWrapperRSC } from "~/components/projects/[projectId]/project-details/project-client/project-client-wrapper";
import {
  ProjectDetailsLoading,
  ProjectDetailsWrapperRSC,
} from "~/components/projects/[projectId]/project-details/project-details-wrapper";
import {
  ProjectHeaderLoading,
  ProjectHeaderWrapperRSC,
} from "~/components/projects/[projectId]/project-header/project-header-wrapper";
import {
  ProjectHoursChartsLoading,
  ProjectHoursChartsWrapperRSC,
} from "~/components/projects/[projectId]/project-hours-charts/hours-charts-wrapper";
import {
  ProjectRevenueChartsLoading,
  ProjectRevenueChartsWrapperRSC,
} from "~/components/projects/[projectId]/project-revenue-charts/revenue-charts-wrapper";
import { TabsContent } from "~/components/ui/tabs";
import { routes } from "~/lib/navigation";

export default function ProjectIdPage({
  params,
  searchParams,
}: {
  params: unknown;
  searchParams: {
    from: string;
    to: string;
    tab: string;
  };
}) {
  const parsed = routes.projectId.$parseParams(params);
  projectAnalyticsParamsCache.parse(searchParams);

  return (
    <Main>
      <Suspense fallback={<ProjectHeaderLoading />}>
        <ProjectHeaderWrapperRSC id={parsed.id} slug={parsed.slug} />
      </Suspense>

      <Suspense>
        <ProjectMainTabs>
          <TabsContent value="revenue">
            <Suspense fallback={<ProjectRevenueChartsLoading />}>
              <ProjectRevenueChartsWrapperRSC projectId={parsed.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics">
            <Suspense fallback={<ProjectHoursChartsLoading />}>
              <ProjectHoursChartsWrapperRSC projectId={parsed.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="details">
            <section className="grid grid-cols-2 gap-4">
              <Suspense fallback={<ProjectDetailsLoading />}>
                <ProjectClientDetailsWrapperRSC projectId={parsed.id} />
              </Suspense>

              <Suspense fallback={<ProjectDetailsLoading />}>
                <ProjectDetailsWrapperRSC projectId={parsed.id} />
              </Suspense>
            </section>
          </TabsContent>

          <TabsContent value="team">
            <section className="grid grid-cols-2 gap-4">
              <Suspense></Suspense>
            </section>
          </TabsContent>
        </ProjectMainTabs>
      </Suspense>
    </Main>
  );
}
