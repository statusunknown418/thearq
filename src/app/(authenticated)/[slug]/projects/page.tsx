import { Suspense } from "react";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { ProjectTrigger } from "~/components/projects/ProjectTrigger";
import {
  ProjectsListLoading,
  ProjectsListRSC,
} from "~/components/projects/projects-list/projects-list-wrapper";

export default function WorkspaceProjectsPage() {
  return (
    <Main>
      <PageHeader>
        <ProjectTrigger />

        <h1 className="text-lg font-semibold">Projects</h1>
      </PageHeader>

      <Suspense fallback={<ProjectsListLoading />}>
        <ProjectsListRSC />
      </Suspense>
    </Main>
  );
}
