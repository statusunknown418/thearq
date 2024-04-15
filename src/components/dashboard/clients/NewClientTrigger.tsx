"use client";

import { PiUserCircleDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useCommandsStore } from "~/lib/stores/commands-store";

export const NewClientTrigger = () => {
  const setCommand = useCommandsStore((s) => s.setCommand);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size={"icon"} subSize={"iconLg"} onClick={() => setCommand("new-project")}>
            <PiUserCircleDuotone size={20} />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="right">
          <KBD>Ctrl</KBD> + <KBD>Shift</KBD> + <KBD>C</KBD>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
