import {
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { PiCommandDuotone, PiMagnifyingGlassDuotone } from "react-icons/pi";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { Button } from "../ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../ui/command";

export const CommandK = () => {
  const search = useCommandsStore((s) => s.opened) === "search";
  const setSearch = useCommandsStore((s) => s.setCommand);

  const onOpenChange = (opened: boolean) => {
    setSearch(opened ? "search" : null);
  };

  return (
    <>
      <Button variant={"secondary"} onClick={() => setSearch(null)}>
        <PiMagnifyingGlassDuotone size={16} />
        Search
        <kbd className="flex items-center text-muted-foreground">
          <PiCommandDuotone size={16} />
          <span className="text-sm">K</span>
        </kbd>
      </Button>

      <CommandDialog open={search} onOpenChange={onOpenChange}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <CalendarIcon className="mr-2" />
              <span>Tracker</span>
            </CommandItem>
            <CommandItem>
              <FaceIcon className="mr-2" />
              <span>Projects</span>
            </CommandItem>
            <CommandItem>
              <RocketIcon className="mr-2" />
              <span>Analytics</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem>
              <PersonIcon className="mr-2" />
              <span>Workspace</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <EnvelopeClosedIcon className="mr-2" />
              <span>Personal</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <GearIcon className="mr-2" />
              <span>Integrations</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
