import { Suspense } from "react";
import { Main } from "~/components/layout/Main";
import {
  ProjectChartsLoading,
  ProjectChartsWrapperRSC,
} from "~/components/projects/[projectId]/project-analytics/charts-wrapper";
import { projectAnalyticsParamsCache } from "~/components/projects/[projectId]/project-cache";
import {
  ProjectDetailsLoading,
  ProjectDetailsWrapperRSC,
} from "~/components/projects/[projectId]/project-details/project-details-wrapper";
import {
  ProjectHeaderLoading,
  ProjectHeaderWrapperRSC,
} from "~/components/projects/[projectId]/project-header/project-header-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { routes } from "~/lib/navigation";

export default function ProjectIdPage({
  params,
  searchParams,
}: {
  params: unknown;
  searchParams: {
    from: string;
    to: string;
  };
}) {
  const parsed = routes.projectId.$parseParams(params);
  projectAnalyticsParamsCache.parse(searchParams);

  return (
    <Main>
      <Suspense fallback={<ProjectHeaderLoading />}>
        <ProjectHeaderWrapperRSC id={parsed.id} slug={parsed.slug} />
      </Suspense>

      <Tabs defaultValue="analytics">
        <TabsList className="max-w-max">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Suspense fallback={<ProjectChartsLoading />}>
            <ProjectChartsWrapperRSC projectId={parsed.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="details">
          <Suspense fallback={<ProjectDetailsLoading />}>
            <ProjectDetailsWrapperRSC id={parsed.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </Main>
  );
}
