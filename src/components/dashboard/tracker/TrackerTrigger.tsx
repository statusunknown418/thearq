"use client";

import { PiSquareLogoDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { useCommandsStore } from "~/lib/stores/commands-store";

export const Tracker = () => {
  const setOpen = useCommandsStore((s) => s.setTrack);

  return (
    <Button variant={"secondary"} className="ml-auto" onClick={() => setOpen(true)}>
      <PiSquareLogoDuotone size={16} />
      Track
      <KBD>T</KBD>
    </Button>
  );
};
