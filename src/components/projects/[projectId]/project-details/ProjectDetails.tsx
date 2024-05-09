"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ClientsCombobox } from "~/components/clients/ClientsCombobox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { SingleDatePicker } from "~/components/ui/single-date-picker";
import { Textarea } from "~/components/ui/textarea";
import { useSafeParams } from "~/lib/navigation";
import { projectsSchema, type ProjectSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const ProjectDetails = ({
  initialData,
}: {
  initialData: RouterOutputs["projects"]["getDetails"];
}) => {
  const params = useSafeParams("projectId");

  const utils = api.useUtils();

  const { mutate } = api.projects.edit.useMutation({
    onError: (error) => {
      toast.error("Failed to update project", {
        description: error.message,
      });
    },
    onSettled: () => {
      void utils.projects.invalidate();
      void utils.viewer.getAssignedProjects.invalidate();
    },
  });

  const { data } = api.projects.getDetails.useQuery(
    {
      shareableUrl: params.id,
    },
    {
      initialData,
    },
  );

  const form = useForm<ProjectSchema>({
    resolver: valibotResolver(projectsSchema),
    defaultValues: {
      id: data?.project.id,
      description: data?.project.description,
      clientId: data?.project.clientId,
      color: data?.project.color,
      name: data?.project.name,
      startsAt: data?.project.startsAt,
      endsAt: data?.project.endsAt,
    },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  return (
    <Form {...form}>
      <form
        className="flex h-max w-full flex-col gap-4 rounded-lg border bg-popover p-4"
        onSubmit={onSubmit}
      >
        <FormField
          name="clientId"
          control={form.control}
          render={() => (
            <FormItem className="grid w-full grid-cols-5 gap-2">
              <FormLabel>Client</FormLabel>

              <div className="col-span-4 flex flex-col gap-2">
                <ClientsCombobox showLabel={false} onSelect={onSubmit} />
              </div>
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5 gap-2">
              <FormLabel>Description</FormLabel>

              <div className="col-span-4 flex flex-col gap-2">
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    onBlur={onSubmit}
                    placeholder={"Add a description"}
                  />
                </FormControl>

                <FormDescription>Internal notes, not shared with the client</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          name="budgetHours"
          control={form.control}
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5 gap-2">
              <FormLabel>Budget hours</FormLabel>

              <section className="col-span-4 flex flex-col gap-2">
                <div className="flex items-center gap-0">
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onBlur={onSubmit}
                      placeholder={"200"}
                      className="w-24 rounded-r-none"
                    />
                  </FormControl>

                  <span className="flex h-9 items-center justify-center rounded-r-lg border border-l-0 bg-muted px-4 text-muted-foreground">
                    hours
                  </span>
                </div>

                <FormDescription>
                  Amount of hours expected to complete the project (optional)
                </FormDescription>
              </section>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-5 items-center justify-between gap-4">
          <FormField
            name="startsAt"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-3 grid grid-cols-6 flex-row">
                <FormLabel className="col-span-2">Timeline</FormLabel>

                <div className="col-span-4 w-full">
                  <SingleDatePicker
                    buttonClassName="min-w-full"
                    date={field.value ?? undefined}
                    onChange={field.onChange}
                    onBlur={onSubmit}
                    placeholder="Start date"
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="endsAt"
            control={form.control}
            render={({ field }) => (
              <div className="col-span-2 w-full">
                <SingleDatePicker
                  buttonClassName="min-w-full"
                  date={field.value ?? undefined}
                  defaultMonth={field.value ?? undefined}
                  onChange={field.onChange}
                  onBlur={onSubmit}
                  placeholder="End date"
                />
              </div>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
