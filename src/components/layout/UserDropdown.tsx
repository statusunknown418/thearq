"use client";

import { DoubleArrowRightIcon, ExitIcon, GearIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useAuthStore } from "~/lib/stores/auth-store";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="w-max">
          {user?.image ? (
            <Image
              src={user?.image}
              alt={user?.name ?? ""}
              width={28}
              height={28}
              className="rounded-sm border"
            />
          ) : (
            <Skeleton className="h-8 w-8 rounded" />
          )}
          <span>{user?.name}</span>

          <DoubleArrowRightIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start">
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
