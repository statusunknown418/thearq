"use client";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { PiPlusCircleDuotone } from "react-icons/pi";
import { routes } from "~/lib/navigation";
import { parsePermissions, useAuthStore } from "~/lib/stores/auth-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { updateCookiesAction } from "../../lib/actions/cookies.actions";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";

export const WorkspaceCombobox = () => {
  const { data } = api.workspaces.get.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const [value, changeValue] = useState("");
  const [open, change] = useState(false);

  const updatePermissionsClient = useAuthStore((s) => s.updatePermissions);
  const deferred = useDeferredValue(value);
  const router = useRouter();
  const workspace = useWorkspaceStore((s) => s.active);
  const image = useMemo(() => {
    if (workspace?.image) {
      return workspace.image;
    }

    if (deferred && data?.length) {
      const src = data?.find((w) => w.workspace.name.toLowerCase() === deferred.toLowerCase())
        ?.workspace.image;

      return src ?? "/favicon.ico";
    }

    return "/favicon.ico";
  }, [deferred, data, workspace]);

  useEffect(() => {
    if (workspace) {
      changeValue(workspace.name);
    }
  }, [workspace]);

  if (!workspace) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Popover onOpenChange={change} open={open}>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} className="h-10 w-full justify-between">
          <div className="flex items-center gap-2">
            {!!value && deferred && !!data?.length ? (
              <Image
                src={image}
                alt={value}
                width={24}
                height={24}
                className="h-6 w-6 flex-none rounded-[6px]"
              />
            ) : (
              <Skeleton className="h-6 w-6" />
            )}

            <span className="max-w-[20ch] overflow-hidden text-ellipsis">{deferred}</span>
          </div>

          <CaretSortIcon
            className={cn(
              "h-5 w-5 flex-none justify-self-end text-muted-foreground transition-all",
              open && "-rotate-90",
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandEmpty>No workspace found</CommandEmpty>

          <CommandGroup>
            <div className="max-h-56 overflow-y-scroll">
              {data?.map((w) => (
                <CommandItem
                  key={w.workspaceId}
                  onSelect={async () => {
                    const data = new FormData();
                    data.append("slug", w.workspace.slug);
                    data.append("permissions", w.permissions);
                    data.append("role", w.role);
                    data.append("id", String(w.workspaceId));
                    await updateCookiesAction(data);

                    updatePermissionsClient(parsePermissions(w.permissions));
                    changeValue(w.workspace.name);

                    w.role === "admin"
                      ? router.replace(routes.dashboard({ slug: w.workspace.slug }))
                      : router.replace(routes.tracker({ slug: w.workspace.slug, search: {} }));
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "opacity-0",
                      !!value
                        ? value === w.workspace.name && "opacity-100"
                        : workspace.name === w.workspace.name && "opacity-100",
                    )}
                  />

                  <div className="flex items-center gap-2">
                    {w.workspace.image && (
                      <Image
                        src={w.workspace.image}
                        alt={w.workspace.name}
                        width={24}
                        height={24}
                        className="rounded-sm"
                      />
                    )}
                    <span>{w.workspace.name}</span>
                  </div>
                </CommandItem>
              ))}
            </div>

            <CommandSeparator className="my-1" />

            <CommandItem onSelect={() => router.push(routes.newWorkspace())}>
              <PiPlusCircleDuotone size={16} className="text-primary" />
              <span className="font-medium">New workspace</span>
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
