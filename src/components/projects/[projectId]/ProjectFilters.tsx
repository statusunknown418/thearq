import { ClientsComboboxStandalone } from "~/components/clients/ClientsCombobox";
import { ProjectsComboboxStandalone } from "../ProjectsCombobox";

export const ProjectFilters = () => {
  return (
    <div className="flex items-center gap-2">
      <ProjectsComboboxStandalone />

      <ClientsComboboxStandalone />
    </div>
  );
};
