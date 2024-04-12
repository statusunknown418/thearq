"use client";

import { PiPlus } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useCommandsStore } from "~/lib/stores/commands-store";

export const Tracker = () => {
  const setOpen = useCommandsStore((s) => s.setTrack);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="ml-auto" size={"lg"} onClick={() => setOpen(true)}>
            <PiPlus size={16} />
            Start tracking
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          Start timer
          <KBD>A</KBD>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
