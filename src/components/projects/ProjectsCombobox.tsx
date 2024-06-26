import { CaretDownIcon, CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { PiSquaresFourDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { FormField } from "~/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { type NewTimeEntry } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { Checkbox } from "../ui/checkbox";

type ProjectsComboboxContext = Pick<NewTimeEntry, "projectId">;

export const ProjectsCombobox = ({
  onSelect,
  size = "default",
  triggerClassName,
}: {
  onSelect?: () => void;
  size?: "sm" | "lg" | "default";
  triggerClassName?: string;
}) => {
  const formContext = useFormContext<ProjectsComboboxContext>();

  const [open, setOpen] = useState(false);

  const { data } = api.viewer.getAssignedProjects.useQuery();

  return (
    <FormField
      control={formContext.control}
      name="projectId"
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"secondary"}
              size={size}
              className={cn("w-max bg-muted shadow", triggerClassName)}
            >
              <PiSquaresFourDuotone size={15} />

              <span className="max-w-[10ch] justify-between overflow-hidden text-ellipsis whitespace-nowrap">
                {field.value
                  ? data?.find((c) => c.projectId === field.value)?.project.name
                  : "Project"}
              </span>

              <CaretDownIcon
                className={cn(
                  "ml-auto h-5 w-5 flex-none justify-self-end text-muted-foreground transition-all",
                )}
              />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="min-w-[260px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search" />
              <CommandEmpty>No project found</CommandEmpty>

              <CommandGroup>
                <div className="max-h-56 overflow-y-scroll">
                  {!data ||
                    (data.length === 0 && (
                      <p className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground">
                        There are no projects assigned to you yet
                      </p>
                    ))}

                  {data?.map((relation) => (
                    <CommandItem
                      key={relation.projectId}
                      id={relation.projectId.toString()}
                      value={relation.projectId.toString()}
                      onSelect={() => {
                        if (field.value === relation.projectId) {
                          field.onChange(null);
                        } else {
                          field.onChange(relation.projectId);
                        }

                        onSelect?.();
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "opacity-0",
                          field.value === relation.projectId && "opacity-100",
                        )}
                      />

                      <div className="flex w-full items-center gap-2">
                        <div
                          className={cn("h-3 w-3 rounded-full bg-gray-600")}
                          style={{
                            backgroundColor: relation.project.color,
                          }}
                        />
                        <span>{relation.project.name}</span>
                        {relation.project.client?.name && (
                          <span className="text-muted-foreground">&middot;</span>
                        )}
                        <p className="text-muted-foreground">{relation.project.client?.name}</p>
                      </div>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    />
  );
};

export const ProjectsComboboxStandalone = ({
  onSelect,
  size = "default",
}: {
  onSelect?: () => void;
  size?: "sm" | "lg" | "default";
}) => {
  const { data } = api.viewer.getAssignedProjects.useQuery();

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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={field.length > 0 ? "secondary" : "outline"} size={size} className="w-max">
          <PiSquaresFourDuotone size={15} />

          <span
            className={cn(
              "max-w-[10ch] justify-between overflow-hidden text-ellipsis whitespace-nowrap",
              size === "sm" && "font-normal",
            )}
          >
            Project
          </span>

          {field.length > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-primary/50 bg-primary/10 p-1 text-[11px]">
              {field.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandEmpty>No project found</CommandEmpty>

          <CommandGroup>
            <div className="max-h-56 overflow-y-scroll">
              {!data ||
                (data.length === 0 && (
                  <p className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground">
                    There are no projects assigned to you yet
                  </p>
                ))}

              {data?.map((relation) => (
                <CommandItem
                  className="group"
                  key={relation.projectId}
                  value={relation.projectId.toString()}
                  onSelect={() => {
                    onFieldChange(relation.projectId);
                  }}
                >
                  <Checkbox
                    className={cn(
                      "opacity-0 transition-all duration-150 group-hover:opacity-100",
                      field.includes(relation.projectId) && "opacity-100",
                    )}
                    checked={field.includes(relation.projectId)}
                  />

                  <div className="flex w-full items-center gap-2">
                    <div
                      className={cn("h-3 w-3 rounded-full bg-gray-600")}
                      style={{
                        backgroundColor: relation.project.color,
                      }}
                    />
                    <span>{relation.project.name}</span>
                    {relation.project.client?.name && (
                      <span className="text-muted-foreground">&middot;</span>
                    )}
                    <p className="text-muted-foreground">{relation.project.client?.name}</p>
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
