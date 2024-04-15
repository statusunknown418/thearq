"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useFormContext } from "react-hook-form";
import { PiPlusCircle } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "~/components/ui/command";
import { FormControl, FormField, FormLabel } from "~/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { type ProjectSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";

export const ClientsCombobox = () => {
  const formContext = useFormContext<ProjectSchema>();
  const { data } = api.clients.getByWorkspace.useQuery(undefined, {});

  return (
    <FormField
      control={formContext.control}
      name="clientId"
      render={({ field }) => (
        <Popover>
          <div className="flex w-full flex-col gap-2">
            <FormLabel>Client</FormLabel>

            <FormControl>
              <PopoverTrigger asChild>
                <Button variant={"secondary"} size={"lg"} className="flex-grow justify-between">
                  <span>
                    {field.value
                      ? data?.find((c) => c.id === field.value)?.name
                      : "Select a client"}
                  </span>

                  <CaretSortIcon
                    className={cn(
                      "h-5 w-5 flex-none justify-self-end text-muted-foreground transition-all",
                    )}
                  />
                </Button>
              </PopoverTrigger>
            </FormControl>
          </div>

          <PopoverContent className="w-[--radix-popover-anchor-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search" />
              <CommandEmpty>No workspace found</CommandEmpty>

              <CommandGroup>
                <div className="max-h-56 overflow-y-scroll">
                  {data?.map((client) => (
                    <CommandItem
                      key={client.workspaceId}
                      onSelect={async () => {
                        const data = new FormData();
                      }}
                    >
                      <CheckIcon
                        className={cn("opacity-0", field.value === client.id && "opacity-100")}
                      />

                      <div className="flex items-center gap-2">
                        <span>{client.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </div>

                <CommandSeparator className="my-1" />

                <CommandItem
                  onSelect={() => {
                    return;
                  }}
                >
                  <PiPlusCircle size={16} className="text-primary" />
                  <span className="font-medium">Add client</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    />
  );
};
