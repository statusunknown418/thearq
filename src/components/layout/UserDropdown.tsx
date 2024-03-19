"use client";

import { CaretSortIcon, ExitIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoIosCog } from "react-icons/io";
import { routes } from "~/lib/navigation";
import { useAuthStore } from "~/lib/stores/auth-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";

export const UserDropdown = () => {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);
  const selectedWorkspace = useWorkspaceStore((s) => s.active);
  const [open, change] = useState(false);

  if (!user) {
    return <Skeleton className="h-8 w-full" />;
  }

  return (
    <DropdownMenu open={open} onOpenChange={change}>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="w-full justify-between focus-visible:ring-0">
          <div className="flex items-center gap-2">
            {user?.image && (
              <Image
                src={user?.image}
                alt={user?.name ?? ""}
                width={28}
                height={28}
                className="rounded-sm border"
              />
            )}

            <span className="max-w-[10ch] overflow-hidden text-ellipsis">{user?.name}</span>
          </div>

          <CaretSortIcon
            className={cn("h-5 w-5 text-muted-foreground transition-all", open && "rotate-90")}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="end">
        <DropdownMenuLabel>
          <span>{user?.name}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={routes.account({ slug: selectedWorkspace?.slug ?? "" })}>
            <IoIosCog size={16} />
            <span>My settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={async () => {
            clearAuth();
            await signOut({
              callbackUrl: "/",
            });
          }}
        >
          <ExitIcon className="text-destructive" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
