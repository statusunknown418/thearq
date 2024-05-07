"use client";

import { type ReactNode } from "react";
import { PiPlugDuotone } from "react-icons/pi";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const AddIntegrationsModal = ({ children }: { children: ReactNode }) => {
  return (
    <Dialog>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button size={"icon"} subSize={"iconLg"}>
                <PiPlugDuotone size={24} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>

          <TooltipContent align="start">Add more integrations</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect</DialogTitle>
          <DialogDescription>
            Connect your account with third-party services to make your life easier and track from
            any place.
          </DialogDescription>
        </DialogHeader>

        <section className="grid grid-cols-2 gap-4">{children}</section>
        <p className="text-xs text-muted-foreground">✨ More integrations are coming soon!</p>
      </DialogContent>
    </Dialog>
  );
};
