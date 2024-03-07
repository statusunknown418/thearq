"use client";

import { DoubleArrowRightIcon, ExitIcon, GearIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "~/lib/stores/auth-store";
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
  const [open, change] = useState(false);

  if (!user) {
    return <Skeleton className="h-9 w-full" />;
  }

  return (
    <DropdownMenu open={open} onOpenChange={change}>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="w-full justify-between">
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

          <DoubleArrowRightIcon
            className={cn("text-muted-foreground transition-all", open && "rotate-180")}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="end">
        <DropdownMenuLabel>
          <span>{user?.name}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <GearIcon />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={async () => {
            clearAuth();
            await signOut({
              callbackUrl: "/",
            });
          }}
        >
          <ExitIcon />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
