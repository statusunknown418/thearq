"use client";

import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { Button } from "../ui/button";
import { UserDropdown } from "./UserDropdown";
import { WorkspaceCombobox } from "./WorkspaceCombobox";

export const PageNavigation = () => {
  const workspace = useWorkspaceStore((s) => s.active);
  const router = useRouter();

  return (
    <nav className="col-span-2 grid grid-cols-1 gap-4 border-r">
      <header className="flex h-max items-center gap-1 p-2">
        <WorkspaceCombobox />
        <UserDropdown />
      </header>

      <Button onClick={() => router.back()} variant={"neutral"} size={"circle"}>
        <ArrowLeftIcon />
      </Button>

      <Button asChild>
        <Link href={`/workspaces/${workspace?.slug}`}>Tracker</Link>
      </Button>

      <Button asChild>
        <Link href={routes.insights({ slug: workspace?.slug ?? "", search: {} })}>Insights</Link>
      </Button>
    </nav>
  );
};
