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

        <div className="flex gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold">Projects</h1>

            <p className="text-muted-foreground">
              Manage your client projects and team members all in one place.
            </p>
          </div>
        </div>
      </PageHeader>

      <Suspense fallback={<ProjectsListLoading />}>
        <ProjectsListRSC />
      </Suspense>
    </Main>
  );
}
