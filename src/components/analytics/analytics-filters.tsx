import { PiLink } from "react-icons/pi";
import { ClientsComboboxStandalone } from "../clients/ClientsCombobox";
import { ProjectsComboboxStandalone } from "../projects/ProjectsCombobox";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const AnalyticsFilters = () => {
  return (
    <div className="flex items-center gap-2">
      <ProjectsComboboxStandalone />

      <ClientsComboboxStandalone />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"secondary"} className="w-max">
            <PiLink size={15} />
            Integration
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem>Option 1</DropdownMenuItem>
          <DropdownMenuItem>Option 2</DropdownMenuItem>
          <DropdownMenuItem>Option 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
