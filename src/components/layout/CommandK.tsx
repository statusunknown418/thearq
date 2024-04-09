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
import { useEventsStore } from "~/lib/stores/events-store";
import { TrackerCommand } from "../dashboard/tracker/TrackerCommand";
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
  const search = useCommandsStore((s) => s.search);
  const track = useCommandsStore((s) => s.track);
  const setSearch = useCommandsStore((s) => s.setSearch);
  const defaultEvent = useEventsStore((s) => s.temporalEvents[0]);

  return (
    <>
      <Button variant={"secondary"} onClick={() => setSearch(true)}>
        <PiMagnifyingGlassDuotone size={16} />
        Search
        <kbd className="flex items-center text-muted-foreground">
          <PiCommandDuotone size={16} />
          <span className="text-sm">K</span>
        </kbd>
      </Button>

      <CommandDialog open={search} onOpenChange={setSearch}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <CalendarIcon className="mr-2" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <FaceIcon className="mr-2" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <RocketIcon className="mr-2" />
              <span>Launch</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem>
              <PersonIcon className="mr-2" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <EnvelopeClosedIcon className="mr-2" />
              <span>Mail</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <GearIcon className="mr-2" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {track && <TrackerCommand defaultValues={defaultEvent} />}
    </>
  );
};
