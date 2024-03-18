"use client";

import { TriangleRightIcon } from "@radix-ui/react-icons";
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
import { Separator } from "~/components/ui/separator";
import { routes, sidebarLinks } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { type Roles } from "~/server/db/edge-schema";
import { Button } from "../../ui/button";
import { CommandK } from "../CommandK";
import { UserDropdown } from "../UserDropdown";
import { WorkspaceCombobox } from "../WorkspaceCombobox";

export const Sidebar = ({ role }: { role: Roles }) => {
  const workspace = useWorkspaceStore((s) => s.active);
  const selectedSegment = useSelectedLayoutSegment();

  return (
    <aside className="col-span-1 flex h-full flex-col gap-8 py-4 *:px-2">
      <div className="flex w-full flex-col gap-4 self-start">
        <WorkspaceCombobox />

        <CommandK />
      </div>

      <ul className="flex h-full w-full flex-col gap-1 overflow-y-scroll text-muted-foreground">
        {role === "admin" && (
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
              <PiPlanetDuotone size={20} className="group-data-[active=true]:text-purple-400" />
              Dashboard
            </Link>
          </Button>
        )}

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
          <Link href={routes.tracker({ slug: workspace?.slug ?? "" })}>
            <PiTimerDuotone className="h-5 w-5 group-data-[active=true]:text-blue-400" />
            Tracker
          </Link>
        </Button>

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
            <PiChartBarDuotone size={20} className="group-data-[active=true]:text-indigo-400" />
            Analytics
          </Link>
        </Button>

        <Separator className="my-3" />

        {role === "admin" && (
          <div className="flex flex-col gap-1">
            <h3 className="mb-2 inline-flex items-center pl-4 text-xs">
              Manage <TriangleRightIcon />
            </h3>

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
                  className="group-data-[active=true]:text-fuchsia-400"
                  data-active={selectedSegment === sidebarLinks.projects}
                />
                Projects
              </Link>
            </Button>

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
                  className="group-data-[active=true]:text-orange-400"
                  data-active={selectedSegment === sidebarLinks.invoices}
                />
                Invoices
              </Link>
            </Button>

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
                <PiCalculatorDuotone size={20} className="group-data-[active=true]:text-teal-400" />
                Quotes
              </Link>
            </Button>

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
                <PiUsersDuotone size={20} className="group-data-[active=true]:text-green-400" />
                Team
              </Link>
            </Button>

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
          </div>
        )}
      </ul>

      <div className="w-full">
        <UserDropdown />
      </div>
    </aside>
  );
};
