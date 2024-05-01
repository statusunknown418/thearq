"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { PiBuildingsDuotone, PiUserCircleDuotone } from "react-icons/pi";
import { routes, settingsLinks } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { type Roles } from "~/server/db/edge-schema";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export const SettingsNav = ({ role }: { role: Roles }) => {
  const segments = useSelectedLayoutSegments();
  const workspace = useWorkspaceStore((s) => s.active);

  return (
    <aside className="min-w-[200px] border-r text-xs">
      <ul className="grid grid-cols-1 gap-4 p-4">
        {role === "admin" && (
          <>
            <ul className="flex flex-col gap-1 *:ml-3">
              <h3 className="!ml-0 flex h-9 items-center gap-2 text-muted-foreground">
                <PiBuildingsDuotone size={20} />
                Workspace
              </h3>

              <Button
                asChild
                variant={"ghost"}
                className={cn(
                  "justify-start border-transparent text-muted-foreground",
                  segments.length === 0 && "border-border bg-popover text-foreground",
                )}
              >
                <Link href={routes.settings({ slug: workspace?.slug ?? "" })}>General</Link>
              </Button>

              <Button
                variant={"ghost"}
                className={cn(
                  "justify-start border-transparent text-muted-foreground",
                  segments.includes(settingsLinks.plans) &&
                    "border-border bg-popover text-foreground",
                )}
              >
                Plans
              </Button>

              <Button
                variant={"ghost"}
                className={cn(
                  "justify-start border-transparent text-muted-foreground",
                  segments.includes(settingsLinks.defaultValues) &&
                    "border-border bg-popover text-foreground",
                )}
              >
                Default values
              </Button>
            </ul>

            <Separator />
          </>
        )}

        <ul className="flex flex-col gap-1 *:ml-3">
          <h3 className="!ml-0 flex h-9 items-center gap-2 text-muted-foreground">
            <PiUserCircleDuotone size={20} />
            My account
          </h3>

          <Button
            asChild
            variant={"ghost"}
            className={cn(
              "justify-start border-transparent text-muted-foreground",
              segments.includes(settingsLinks.account) &&
                "border-border bg-popover text-foreground",
            )}
          >
            <Link href={routes.account({ slug: workspace?.slug ?? "" })}>Personal</Link>
          </Button>

          <Button
            asChild
            variant={"ghost"}
            className={cn(
              "justify-start border-transparent text-muted-foreground",
              segments.includes(settingsLinks.integrations) &&
                "border-border bg-popover text-foreground",
            )}
          >
            <Link href={routes.integrations({ slug: workspace?.slug ?? "" })}>Integrations</Link>
          </Button>
        </ul>
      </ul>
    </aside>
  );
};
