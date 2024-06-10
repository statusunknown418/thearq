import { ClientsComboboxStandalone } from "../clients/ClientsCombobox";
import { ProjectsComboboxStandalone } from "../projects/ProjectsCombobox";

export const AnalyticsFilters = () => {
  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-muted-foreground">Filters</p>
      <ProjectsComboboxStandalone size="sm" />

      <ClientsComboboxStandalone size="sm" />
    </div>
  );
};
