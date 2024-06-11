"use client";

import { PiKanbanDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useCommandsStore } from "~/lib/stores/commands-store";

export const ProjectTrigger = () => {
  const setCommand = useCommandsStore((s) => s.setCommand);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size={"icon"} onClick={() => setCommand("new-project")}>
            <PiKanbanDuotone size={20} />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="right">
          New project
          <KBD>⌘</KBD> + <KBD>Shift</KBD> + <KBD>Y</KBD>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
