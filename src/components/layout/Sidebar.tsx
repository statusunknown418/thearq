"use client";

import Link from "next/link";
import { routes } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { UserDropdown } from "./UserDropdown";
import { WorkspaceCombobox } from "./WorkspaceCombobox";

export const Sidebar = () => {
  const workspace = useWorkspaceStore((s) => s.active);

  return (
    <aside className="col-span-1 grid grid-cols-1 gap-4 bg-secondary-background px-2 py-4">
      <div className="flex flex-col gap-4 self-start">
        <WorkspaceCombobox />
      </div>

      <ul className="flex h-full w-full flex-col gap-2">
        <Button asChild variant={"ghost"} className="relative">
          <Link href={`/workspaces/${workspace?.slug}`}>Tracker</Link>
        </Button>

        <Separator />

        <Button asChild variant={"ghost"}>
          <Link href={routes.insights({ slug: workspace?.slug ?? "", search: {} })}>Insights</Link>
        </Button>

        <Button asChild variant={"ghost"}>
          <Link href={routes.insights({ slug: workspace?.slug ?? "", search: {} })}>Insights</Link>
        </Button>

        <Button asChild variant={"ghost"}>
          <Link href={routes.insights({ slug: workspace?.slug ?? "", search: {} })}>Insights</Link>
        </Button>
      </ul>

      <div className="w-full self-end">
        <UserDropdown />
      </div>
    </aside>
  );
};
