import { Suspense } from "react";
import { Main } from "~/components/layout/Main";
import { ProjectHeaderWrapperRSC } from "~/components/projects/[projectId]/project-header-wrapper";
import { routes } from "~/lib/navigation";

export default function ProjectIdPage({ params }: { params: unknown }) {
  const parsed = routes.projectId.$parseParams(params);

  return (
    <Main>
      <Suspense>
        <ProjectHeaderWrapperRSC id={parsed.id} slug={parsed.slug} />
      </Suspense>

      <section>
        <h2>Project tracking time</h2>
      </section>
    </Main>
  );
}
