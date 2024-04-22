import { Suspense } from "react";
import { ProjectHeaderWrapperRSC } from "~/components/dashboard/projects/project-id/project-header-wrapper";
import { Main } from "~/components/layout/Main";
import { routes } from "~/lib/navigation";

export default function ProjectIdPage({ params }: { params: unknown }) {
  const parsed = routes.projectId.$parseParams(params);

  return (
    <Main>
      <Suspense>
        <ProjectHeaderWrapperRSC id={parsed.id} slug={parsed.slug} />
      </Suspense>
    </Main>
  );
}
