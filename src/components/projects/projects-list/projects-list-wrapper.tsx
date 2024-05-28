import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/server";
import { ProjectsTable } from "./ProjectsTable";

export const ProjectsListLoading = () => {
  return <Loader />;
};

export const ProjectsListRSC = async () => {
  const projects = await api.projects.getAll.query();

  return <ProjectsTable initialData={projects} />;
};
