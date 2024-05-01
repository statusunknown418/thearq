import { CaretDownIcon, CheckIcon } from "@radix-ui/react-icons";
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

type ProjectsComboboxContext = Pick<NewTimeEntry, "projectId">;

export const ProjectsCombobox = ({
  onSelect,
  size = "default",
}: {
  onSelect?: () => void;
  size?: "sm" | "lg" | "default";
}) => {
  const formContext = useFormContext<ProjectsComboboxContext>();

  const { data } = api.viewer.getAssignedProjects.useQuery(undefined, {
    refetchOnMount: false,
  });

  return (
    <>
      <FormField
        control={formContext.control}
        name="projectId"
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"secondary"} size={size} className="w-max bg-muted shadow">
                <PiSquaresFourDuotone size={15} />

                <span className="max-w-[10ch] justify-between overflow-hidden text-ellipsis whitespace-nowrap">
                  {field.value
                    ? data?.find((c) => c.projectId === field.value)?.project.name
                    : "Project"}
                </span>

                <CaretDownIcon
                  className={cn(
                    "h-5 w-5 flex-none justify-self-end text-muted-foreground transition-all",
                  )}
                />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-0" align="center">
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
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "opacity-0",
                            field.value === relation.projectId && "opacity-100",
                          )}
                        />

                        <div className="flex items-center gap-2">
                          <div
                            className={cn("h-3 w-3 rounded-full bg-gray-600")}
                            style={{
                              backgroundColor: relation.project.color,
                            }}
                          />
                          <span>{relation.project.name}</span>
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
    </>
  );
};
