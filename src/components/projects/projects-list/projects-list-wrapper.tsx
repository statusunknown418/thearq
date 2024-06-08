import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/server";
import { ProjectsTable } from "./ProjectsTable";

export const ProjectsListLoading = () => {
  return <Loader />;
};

export const ProjectsListRSC = async () => {
  const [projects, viewer] = await Promise.all([
    api.projects.getAll.query(),
    api.viewer.getPermissions.query(),
  ]);

  return <ProjectsTable initialData={projects} role={viewer.role} />;
};
