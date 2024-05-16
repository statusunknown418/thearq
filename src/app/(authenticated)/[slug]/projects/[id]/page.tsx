import dynamic from "next/dynamic";
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
import { ProjectHoursChartsLoading } from "~/components/projects/[projectId]/project-hours-charts/hours-charts-wrapper";
import {
  ProjectRevenueChartsLoading,
  ProjectRevenueChartsWrapperRSC,
} from "~/components/projects/[projectId]/project-revenue-charts/revenue-charts-wrapper";
import {
  ProjectTeamLoading,
  ProjectTeamWrapper,
} from "~/components/projects/[projectId]/project-team/project-team-wrapper";
import { TabsContent } from "~/components/ui/tabs";
import { routes } from "~/lib/navigation";

const DynamicPersonSheet = dynamic(() =>
  import("~/components/projects/[projectId]/project-team/ProjectPersonSheet").then(
    (mod) => mod.ProjectPersonSheet,
  ),
);

const DynamicHoursCharts = dynamic(() =>
  import("~/components/projects/[projectId]/project-hours-charts/hours-charts-wrapper").then(
    (mod) => mod.ProjectHoursChartsWrapperRSC,
  ),
);

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
              <DynamicHoursCharts projectId={parsed.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings">
            <section className="grid grid-cols-2 gap-5">
              <Suspense fallback={<ProjectDetailsLoading />}>
                <ProjectDetailsWrapperRSC projectId={parsed.id} />
              </Suspense>

              <Suspense fallback={<ProjectDetailsLoading />}>
                <ProjectClientDetailsWrapperRSC projectId={parsed.id} />
              </Suspense>
            </section>
          </TabsContent>

          <TabsContent value="team">
            <Suspense fallback={<ProjectTeamLoading />}>
              <ProjectTeamWrapper id={parsed.id} />
            </Suspense>
          </TabsContent>
        </ProjectMainTabs>

        <Suspense>
          <DynamicPersonSheet />
        </Suspense>
      </Suspense>
    </Main>
  );
}
