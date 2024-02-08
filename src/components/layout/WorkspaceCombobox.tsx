"use client";
import { CaretSortIcon, CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
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
  const { data } = api.workspaces.get.useQuery();
  const [value, changeValue] = useState("");
  const [open, change] = useState(false);

  const router = useRouter();
  const workspace = useWorkspaceStore((s) => s.active);

  if (!workspace) {
    return <Skeleton className="h-9 w-full" />;
  }

  return (
    <Popover onOpenChange={change} open={open}>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} className="w-full">
          {!!value && (
            <Image
              src={
                data?.find((w) => w.workspace.name.toLowerCase() === value.toLowerCase())?.workspace
                  .image ?? ""
              }
              alt={value}
              width={24}
              height={24}
              className="rounded-sm"
            />
          )}

          {!!workspace && (
            <Image
              src={workspace?.image ?? ""}
              alt={workspace?.name ?? ""}
              width={24}
              height={24}
              className="rounded-sm"
            />
          )}

          <span className="max-w-max overflow-hidden text-ellipsis">
            {!!value ? value : workspace ? workspace.name : "Select workspace"}
          </span>

          <CaretSortIcon
            className={cn("h-5 w-5 text-muted-foreground transition-all", open && "-rotate-90")}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandEmpty>No workspace found</CommandEmpty>

          <CommandGroup>
            {data?.map((w) => (
              <CommandItem
                key={w.workspaceSlug}
                onSelect={() => {
                  changeValue(w.workspace.name);
                  router.replace(routes.dashboard({ slug: w.workspace.slug }));
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

            <CommandSeparator className="my-1" />

            <CommandItem onSelect={() => router.push(routes.newWorkspace())}>
              <PlusCircledIcon className="text-primary" />
              <span className="font-medium">New workspace</span>
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
