"use client";

import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "~/lib/navigation";
import { useAuthStore } from "~/lib/stores/auth-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { Button } from "../ui/button";

export const PageNavigation = () => {
  const user = useAuthStore((s) => s.user);
  const workspace = useWorkspaceStore((s) => s.active);
  const router = useRouter();

  return (
    <nav className="col-span-2 grid grid-cols-1 gap-4 border-r">
      {workspace ? <h3>{workspace?.name}</h3> : <p>Select a workspace</p>}

      <h3>{user?.name}</h3>

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
