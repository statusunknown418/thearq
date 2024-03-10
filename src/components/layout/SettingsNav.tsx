"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "~/lib/utils";

export const SettingsNav = () => {
  const segment = useSelectedLayoutSegment();

  return (
    <aside className="min-w-[200px] border-r text-xs">
      <ul className="grid grid-cols-1 gap-2 p-3">
        <li className={cn("flex h-9 items-center rounded-md px-4", !segment && "bg-muted")}>
          General
        </li>
        <li
          className={cn(
            "flex h-9 items-center rounded-md px-4",
            segment === "account" && "bg-muted",
          )}
        >
          Currencies
        </li>
        <li
          className={cn(
            "flex h-9 items-center rounded-md px-4",
            segment === "account" && "bg-muted",
          )}
        >
          Account
        </li>
      </ul>
    </aside>
  );
};
