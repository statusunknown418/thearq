"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { DatePicker } from "@tremor/react";
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
    },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  return (
    <Form {...form}>
      <form
        className="flex h-max w-full flex-col gap-4 rounded-lg border bg-secondary-background p-4"
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

              <div className="col-span-4 flex flex-col gap-2">
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onBlur={onSubmit}
                    placeholder={"200 hours"}
                  />
                </FormControl>

                <FormDescription>
                  Amount of hours expected to complete the project (optional)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-5 items-center justify-between gap-4">
          <FormField
            name="startsAt"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-3 grid grid-cols-6 flex-row items-center">
                <FormLabel className="col-span-2">Timeline</FormLabel>

                <div className="col-span-4 w-full">
                  <DatePicker />
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="endsAt"
            control={form.control}
            render={({ field }) => (
              <div className="col-span-2 w-full">
                <DatePicker />
              </div>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
