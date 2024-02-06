"use client";

import Link from "next/link";
import { routes } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { Button } from "../ui/button";
import { UserDropdown } from "./UserDropdown";
import { WorkspaceCombobox } from "./WorkspaceCombobox";

export const Sidebar = () => {
  const workspace = useWorkspaceStore((s) => s.active);

  return (
    <aside className="col-span-2 grid grid-cols-1 gap-4">
      <WorkspaceCombobox />

      <Button asChild>
        <Link href={`/workspaces/${workspace?.slug}`}>Tracker</Link>
      </Button>

      <Button asChild>
        <Link href={routes.insights({ slug: workspace?.slug ?? "", search: {} })}>Insights</Link>
      </Button>

      <UserDropdown />
    </aside>
  );
};
