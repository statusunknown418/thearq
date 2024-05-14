import { ClientsComboboxStandalone } from "../clients/ClientsCombobox";
import { ProjectsComboboxStandalone } from "../projects/ProjectsCombobox";

export const AnalyticsFilters = () => {
  return (
    <div className="flex items-center gap-2">
      <ProjectsComboboxStandalone />

      <ClientsComboboxStandalone />
    </div>
  );
};
