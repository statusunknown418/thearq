"use client";

import { CalendarIcon, DotIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { useFormContext } from "react-hook-form";
import { PiArrowRight, PiCircleDashed, PiPersonDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { RangePicker } from "~/components/ui/range-picker";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { type InvoiceSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { useInvoicesQS } from "../invoices-cache";

export const ProjectsSection = () => {
  const [{ client }, update] = useInvoicesQS();

  const { data, isLoading } = api.projects.getByClient.useQuery(
    {
      clientId: client ?? 0,
    },
    {
      enabled: !!client,
    },
  );

  const formContext = useFormContext<InvoiceSchema>();

  const [dateRange, setDateRange] = useState<DateRange>({
    from: formContext.getValues("fromDate") ?? undefined,
    to: formContext.getValues("fromDate") ?? undefined,
  });

  const goToNextStep = () => {
    void update((prev) => ({
      ...prev,
      step: "items",
    }));
  };

  if (!client) {
    return (
      <article className="flex flex-col gap-4">
        <h4 className="text-base font-medium text-muted-foreground">Projects</h4>

        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
          <PiPersonDuotone size={24} />
          <p className="text-xs">
            You need to select a client to see the projects associated with it.
          </p>
        </div>
      </article>
    );
  }

  if (isLoading) {
    return (
      <article className="flex flex-col gap-4">
        <h4 className="text-base font-medium text-muted-foreground">Projects</h4>

        <div className="flex flex-col gap-1">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </article>
    );
  }

  if (!data) {
    return (
      <article className="flex flex-col gap-4">
        <h4 className="text-base font-medium text-muted-foreground">Projects</h4>

        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-secondary text-muted-foreground">
          <PiCircleDashed size={24} />
          <p className="text-xs">Oops, no projects found linked to this client</p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full w-full flex-col gap-4">
      <h4 className="text-base font-medium text-muted-foreground">Projects</h4>

      <ScrollArea className="max-h-32">
        <div className="flex flex-col gap-2">
          {data.map((project) => (
            <FormField
              key={project.id}
              control={formContext.control}
              name="projects"
              render={({ field }) => {
                return (
                  <FormLabel
                    htmlFor={String(project.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-sm transition-colors duration-150 hover:bg-secondary",
                      "border px-4 py-3 text-sm font-normal",
                      field.value.includes(project.id) ? "bg-secondary" : "bg-transparent",
                    )}
                  >
                    <FormControl id={String(project.id)}>
                      <Checkbox
                        checked={field.value.includes(project.id)}
                        onCheckedChange={(checked) => {
                          void update((prev) => ({
                            ...prev,
                            projects: checked
                              ? [...prev.projects, project.id]
                              : prev.projects.filter((value) => value !== project.id),
                          }));

                          return checked
                            ? field.onChange([...field.value, project.id])
                            : field.onChange(field.value?.filter((value) => value !== project.id));
                        }}
                      />
                    </FormControl>

                    <p className="flex items-center gap-2">
                      {project.identifier && (
                        <span className="text-muted-foreground">[{project.identifier}]</span>
                      )}

                      <span>{project.name}</span>

                      <DotIcon />

                      {project.startsAt && (
                        <span className="text-muted-foreground">
                          {format(new Date(project.startsAt), "MMM dd, yyyy")}
                        </span>
                      )}

                      {project.endsAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarIcon /> {format(new Date(project.endsAt), "MMM dd, yyyy")}
                        </span>
                      )}
                    </p>
                  </FormLabel>
                );
              }}
            />
          ))}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        {data.length}
        {data.length === 1 ? " project" : " projects"} found linked to this client
      </p>

      <div className="mt-2 grid grid-cols-2 items-end gap-4">
        <FormField
          control={formContext.control}
          name="includeHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Include hours</FormLabel>

              <Select value={String(field.value)} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All non-invoiced hours</SelectItem>
                  <SelectItem value="range">Billable hours from</SelectItem>
                  <SelectItem value="blank">Don&apos;t include any hours</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {formContext.getValues("includeHours") === "range" && (
          <div className="flex items-center">
            <RangePicker
              date={dateRange}
              onDateChange={(v) => {
                if (!v) return;

                setDateRange(v);

                formContext.setValue("fromDate", v?.from);
                formContext.setValue("untilDate", v?.to);
              }}
              placeholder="Select range"
              className="w-full rounded-r-md"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4"></div>

      <div className="flex w-full justify-end">
        <Button variant={"outline"} size={"lg"} type="button" onClick={goToNextStep}>
          Next
          <PiArrowRight />
        </Button>
      </div>
    </article>
  );
};
