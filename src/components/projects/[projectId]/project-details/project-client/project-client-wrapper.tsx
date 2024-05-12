import { api } from "~/trpc/server";
import { ProjectClientDetails } from "./ProjectClient";

export const ProjectClientDetailsWrapperRSC = async ({ projectId }: { projectId: string }) => {
  const data = await api.clients.getByProject.query({
    shareableId: projectId,
  });

  return <ProjectClientDetails initialData={data} projectId={projectId} />;
};
