"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { IoIosCog } from "react-icons/io";
import {
  PiCalculatorDuotone,
  PiChartBarDuotone,
  PiKanbanDuotone,
  PiPaperclip,
  PiPlanetDuotone,
  PiTimerDuotone,
  PiUsersDuotone,
} from "react-icons/pi";
import { KBD } from "~/components/ui/kbd";
import { Separator } from "~/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { routes, sidebarLinks } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/shared";
import { Button } from "../../ui/button";
import { CommandK } from "../CommandK";
import { Hotkeys } from "../Hotkeys";
import { UserDropdown } from "../UserDropdown";
import { WorkspaceCombobox } from "../WorkspaceCombobox";

export const Sidebar = ({
  initialData,
}: {
  initialData: RouterOutputs["viewer"]["getPermissions"];
}) => {
  const workspace = useWorkspaceStore((s) => s.active);
  const selectedSegment = useSelectedLayoutSegment();

  return (
    <aside className="col-span-1 flex h-screen flex-col gap-8 overflow-y-scroll py-4 *:px-2">
      <Hotkeys />

      <div className="flex w-full flex-col gap-4 self-start">
        <WorkspaceCombobox />

        <CommandK />
      </div>

      <TooltipProvider>
        <ul className="flex h-full w-full flex-col gap-1 overflow-y-scroll py-1 text-muted-foreground">
          {initialData.role === "admin" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={"ghost"}
                  className={cn(
                    "group justify-start",
                    "data-[active=true]:bg-popover data-[active=true]:text-foreground",
                    "border border-transparent data-[active=true]:border-border",
                  )}
                  data-active={!selectedSegment}
                >
                  <Link href={routes.dashboard({ slug: workspace?.slug ?? "" })}>
                    <PiPlanetDuotone
                      size={20}
                      className="group-data-[active=true]:text-purple-500 dark:group-data-[active=true]:text-purple-400"
                    />
                    Dashboard
                  </Link>
                </Button>
              </TooltipTrigger>

              <TooltipContent side="right">
                Navigate <KBD>Shift</KBD> + <KBD>D</KBD>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant={"ghost"}
                className={cn(
                  "group justify-start",
                  "data-[active=true]:bg-popover data-[active=true]:text-foreground",
                  "border border-transparent data-[active=true]:border-border",
                )}
                data-active={selectedSegment === sidebarLinks.tracker}
              >
                <Link href={routes.tracker({ slug: workspace?.slug ?? "", search: {} })}>
                  <PiTimerDuotone className="h-5 w-5 group-data-[active=true]:text-blue-500 dark:group-data-[active=true]:text-blue-400" />
                  Tracker
                </Link>
              </Button>
            </TooltipTrigger>

            <TooltipContent side="right">
              Navigate <KBD>Shift</KBD> + <KBD>T</KBD>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant={"ghost"}
                className={cn(
                  "group justify-start",
                  "data-[active=true]:bg-popover data-[active=true]:text-foreground",
                  "border border-transparent data-[active=true]:border-border",
                )}
                data-active={selectedSegment === sidebarLinks.analytics}
              >
                <Link href={routes.analytics({ slug: workspace?.slug ?? "" })}>
                  <PiChartBarDuotone
                    size={20}
                    className="group-data-[active=true]:text-indigo-500 dark:group-data-[active=true]:text-indigo-400"
                  />
                  Analytics
                </Link>
              </Button>
            </TooltipTrigger>

            <TooltipContent side="right">
              Navigate <KBD>Shift</KBD> + <KBD>A</KBD>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant={"ghost"}
                className={cn(
                  "group justify-start",
                  "data-[active=true]:bg-popover data-[active=true]:text-foreground",
                  "border border-transparent data-[active=true]:border-border",
                )}
                data-active={selectedSegment === sidebarLinks.projects}
              >
                <Link href={routes.projects({ slug: workspace?.slug ?? "" })}>
                  <PiKanbanDuotone
                    size={20}
                    className="group-data-[active=true]:text-fuchsia-500 dark:group-data-[active=true]:text-fuchsia-400"
                    data-active={selectedSegment === sidebarLinks.projects}
                  />
                  Projects
                </Link>
              </Button>
            </TooltipTrigger>

            <TooltipContent side="right">
              Navigate <KBD>Shift</KBD> + <KBD>Y</KBD>
            </TooltipContent>
          </Tooltip>

          <Separator className="my-3" />

          <div className="flex flex-col gap-1">
            {initialData.role === "admin" && (
              <>
                <h3 className="mb-2 inline-flex items-center pl-4 text-xs">Manage</h3>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={"ghost"}
                      className={cn(
                        "group justify-start",
                        "data-[active=true]:bg-popover data-[active=true]:text-foreground",
                        "border border-transparent data-[active=true]:border-border",
                      )}
                      data-active={selectedSegment === sidebarLinks.invoices}
                    >
                      <Link href={routes.invoices({ slug: workspace?.slug ?? "" })}>
                        <PiPaperclip
                          size={20}
                          className="group-data-[active=true]:text-orange-500 dark:group-data-[active=true]:text-orange-400"
                          data-active={selectedSegment === sidebarLinks.invoices}
                        />
                        Invoices
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Navigate <KBD>Shift</KBD> + <KBD>I</KBD>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={"ghost"}
                      className={cn(
                        "group justify-start",
                        "data-[active=true]:bg-popover data-[active=true]:text-foreground",
                        "border border-transparent data-[active=true]:border-border",
                      )}
                      data-active={selectedSegment === sidebarLinks.quotes}
                    >
                      <Link href={routes.quotes({ slug: workspace?.slug ?? "" })}>
                        <PiCalculatorDuotone
                          size={20}
                          className="group-data-[active=true]:text-teal-500 dark:group-data-[active=true]:text-teal-400"
                        />
                        Quotes
                      </Link>
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side="right">
                    Navigate <KBD>Shift</KBD> + <KBD>Q</KBD>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={"ghost"}
                  className={cn(
                    "group justify-start",
                    "data-[active=true]:bg-popover data-[active=true]:text-foreground",
                    "border border-transparent data-[active=true]:border-border",
                  )}
                  data-active={selectedSegment === sidebarLinks.team}
                >
                  <Link href={routes.people({ slug: workspace?.slug ?? "" })}>
                    <PiUsersDuotone
                      size={20}
                      className="group-data-[active=true]:text-green-600 dark:group-data-[active=true]:text-green-500"
                    />
                    Team
                  </Link>
                </Button>
              </TooltipTrigger>

              <TooltipContent side="right">
                Navigate <KBD>Shift</KBD> + <KBD>P</KBD>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={"ghost"}
                  className={cn(
                    "group justify-start",
                    "data-[active=true]:bg-popover data-[active=true]:text-foreground",
                    "border border-transparent data-[active=true]:border-border",
                  )}
                  data-active={selectedSegment === sidebarLinks.settings}
                >
                  <Link href={routes.settings({ slug: workspace?.slug ?? "" })}>
                    <IoIosCog size={20} />
                    Settings
                  </Link>
                </Button>
              </TooltipTrigger>

              <TooltipContent side="right">
                Navigate <KBD>Shift</KBD> + <KBD>X</KBD>
              </TooltipContent>
            </Tooltip>
          </div>
        </ul>
      </TooltipProvider>

      <div className="w-full">
        <UserDropdown />
      </div>
    </aside>
  );
};
