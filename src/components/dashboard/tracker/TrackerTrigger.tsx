"use client";

import { PiPlus } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { useCommandsStore } from "~/lib/stores/commands-store";

export const Tracker = () => {
  const setOpen = useCommandsStore((s) => s.setTrack);

  return (
    <Button className="ml-auto" size={"lg"} onClick={() => setOpen(true)}>
      <PiPlus size={16} />
      Start tracking
      <KBD>A</KBD>
    </Button>
  );
};
