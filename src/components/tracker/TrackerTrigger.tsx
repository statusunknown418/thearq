"use client";

import { PiTimerDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useCommandsStore } from "~/lib/stores/commands-store";

export const TrackerTrigger = () => {
  const setOpen = useCommandsStore((s) => s.setCommand);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size={"icon"} subSize={"iconLg"} onClick={() => setOpen("auto-tracker")}>
            <PiTimerDuotone size={24} />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="bottom" align="start">
          Manual entry
          <KBD>A</KBD>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
