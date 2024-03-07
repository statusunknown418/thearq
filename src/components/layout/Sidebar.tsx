"use client";

import { LapTimerIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { IoIosTrendingUp } from "react-icons/io";
import { routes } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { type Roles } from "~/server/db/schema";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { UserDropdown } from "./UserDropdown";
import { WorkspaceCombobox } from "./WorkspaceCombobox";

export const Sidebar = ({ role }: { role: Roles }) => {
  const workspace = useWorkspaceStore((s) => s.active);

  return (
    <aside className="col-span-1 grid grid-cols-1 gap-4 px-2 py-4">
      <div className="flex flex-col gap-4 self-start">
        <WorkspaceCombobox />
      </div>

      <ul className="flex h-full w-full flex-col gap-2">
        {role === "admin" && (
          <Button asChild variant={"ghost"} className="relative justify-start">
            <Link href={routes.dashboard({ slug: workspace?.slug ?? "" })}>Dashboard</Link>
          </Button>
        )}

        <Separator />

        <Button asChild variant={"ghost"} className="relative justify-start">
          <Link href={routes.tracker({ slug: workspace?.slug ?? "" })}>
            <LapTimerIcon className="h-4 w-4 text-blue-400" />
            Tracker
          </Link>
        </Button>

        <Separator />

        <Button asChild variant={"ghost"} className="justify-start">
          <Link href={routes.analytics({ slug: workspace?.slug ?? "" })}>
            <IoIosTrendingUp size={20} className="text-indigo-400" />
            Analytics
          </Link>
        </Button>

        {role === "admin" && (
          <>
            <Button asChild variant={"ghost"} className="justify-start">
              <Link href={routes.invoices({ slug: workspace?.slug ?? "" })}>Invoices</Link>
            </Button>

            <Button asChild variant={"ghost"} className="justify-start">
              <Link href={routes.people({ slug: workspace?.slug ?? "" })}>People</Link>
            </Button>

            <Button asChild variant={"ghost"} className="justify-start">
              <Link href={routes.integrations({ slug: workspace?.slug ?? "" })}>Integrations</Link>
            </Button>
          </>
        )}
      </ul>

      <div className="w-full self-end">
        <UserDropdown />
      </div>
    </aside>
  );
};
