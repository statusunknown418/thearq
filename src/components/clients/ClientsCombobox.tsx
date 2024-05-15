"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { PiPlusCircleDuotone, PiUserDuotone } from "react-icons/pi";
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
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { type ProjectSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { Checkbox } from "../ui/checkbox";

export const ClientsCombobox = ({
  showLabel = true,
  onSelect,
  triggerClassnames,
}: {
  showLabel?: boolean;
  onSelect?: () => void;
  triggerClassnames?: string;
}) => {
  const formContext = useFormContext<ProjectSchema>();

  const { data, refetch } = api.clients.getByWorkspace.useQuery(undefined, {});
  const { mutate, isLoading } = api.clients.create.useMutation({
    onSettled: async () => {
      return await refetch();
    },
  });

  const [combobox, setCombobox] = useState(false);
  const [quickCreate, setQuickCreate] = useState(false);
  const [clientName, setClientName] = useState("");

  return (
    <>
      <FormField
        control={formContext.control}
        name="clientId"
        render={({ field }) => (
          <Popover
            open={combobox}
            onOpenChange={(v) => {
              setCombobox(v);

              if (!v) {
                setQuickCreate(false);
              }
            }}
          >
            <div className={cn("flex w-full flex-col gap-2", triggerClassnames)}>
              {showLabel && <FormLabel>Client</FormLabel>}

              <FormControl>
                <PopoverTrigger asChild>
                  <Button
                    variant={"secondary"}
                    size={"lg"}
                    className="max-w-52 flex-grow justify-between"
                  >
                    <span>
                      {!!field.value
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

            <PopoverContent className={"w-[280px] p-0"} align="start">
              <Command>
                <CommandInput placeholder="Search" />
                <CommandEmpty>No client found</CommandEmpty>

                <CommandGroup>
                  <div className="max-h-56 overflow-y-scroll">
                    {!data ||
                      (data.length === 0 && (
                        <p className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground">
                          You have no clients created yet
                        </p>
                      ))}

                    {data?.map((client) => (
                      <CommandItem
                        key={client.id}
                        onSelect={() => {
                          field.onChange(client.id);
                          onSelect?.();
                          setCombobox(false);
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
                      setQuickCreate(true);
                    }}
                  >
                    <PiPlusCircleDuotone size={16} className="text-primary" />
                    {quickCreate ? (
                      <div className="flex w-full items-center gap-2">
                        <Input
                          variant={"ghost"}
                          className="h-8 flex-grow text-xs"
                          placeholder="Alex Doe"
                          value={clientName}
                          onChange={(e) => setClientName(e.currentTarget.value)}
                          onKeyDown={(e) => {
                            if (clientName.length === 0) return;

                            if (e.key === "Enter") {
                              e.preventDefault();
                              mutate({ name: clientName });
                            }
                          }}
                        />

                        <Button
                          size={"sm"}
                          variant={"link"}
                          disabled={isLoading}
                          onClick={() => {
                            if (clientName.length === 0) return;
                            mutate({ name: clientName });
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium">Add client</span>
                    )}
                  </CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
    </>
  );
};

export const ClientsComboboxStandalone = ({
  onSelect,
}: {
  showLabel?: boolean;
  onSelect?: () => void;
}) => {
  const { data } = api.clients.getByWorkspace.useQuery(undefined, {});

  const [combobox, setCombobox] = useState(false);
  const [field, setField] = useState<number[]>([]);

  const onFieldChange = (id: number) => {
    if (field.includes(id)) {
      setField(field.filter((f) => f !== id));
    } else {
      setField([...field, id]);
    }

    onSelect?.();
  };

  return (
    <Popover open={combobox} onOpenChange={setCombobox}>
      <PopoverTrigger asChild>
        <Button
          variant={field.length > 0 ? "default" : "secondary"}
          className={cn("w-max justify-between")}
        >
          <PiUserDuotone size={15} />
          <span>Client</span>
          {field.length > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-primary/50 bg-primary/10 p-1 text-xs">
              {field.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandEmpty>No client found</CommandEmpty>

          <CommandGroup>
            <div className="max-h-56 overflow-y-scroll">
              {!data ||
                (data.length === 0 && (
                  <p className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground">
                    You have no clients created yet
                  </p>
                ))}

              {data?.map((client) => (
                <CommandItem
                  className="group"
                  key={client.id}
                  value={client.id.toString()}
                  onSelect={() => {
                    onFieldChange(client.id);
                  }}
                >
                  <Checkbox
                    className={cn(
                      "opacity-0 transition-all duration-150 group-hover:opacity-100",
                      field.includes(client.id) && "opacity-100",
                    )}
                    checked={field.includes(client.id)}
                  />

                  <div className="flex items-center gap-2">
                    <span>{client.name}</span>
                  </div>
                </CommandItem>
              ))}
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
