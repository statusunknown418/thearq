"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { Textarea } from "~/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ClientsCombobox } from "~/components/clients/ClientsCombobox";
import {
  FormField,
  FormItem,
  Form,
  FormLabel,
  FormControl,
  FormDescription,
} from "~/components/ui/form";
import { useSafeParams } from "~/lib/navigation";
import { type ProjectSchema, projectsSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { Card } from "@tremor/react";
import { Input } from "~/components/ui/input";

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

  const projectForm = useForm<ProjectSchema>({
    resolver: valibotResolver(projectsSchema),
    defaultValues: {
      id: data?.project.id,
      description: data?.project.description,
      clientId: data?.project.clientId,
      color: data?.project.color,
    },
    mode: "onBlur",
  });

  const onSubmit = projectForm.handleSubmit((values) => {
    mutate(values);
  });

  return (
    <section className="grid grid-cols-2 gap-4">
      <Form {...projectForm}>
        <form className="flex w-full flex-col gap-6" onSubmit={onSubmit}>
          <div className="flex w-full flex-col justify-between gap-4 rounded-lg border bg-secondary-background p-4">
            <FormField
              control={projectForm.control}
              name="clientId"
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
              control={projectForm.control}
              name="description"
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
          </div>
        </form>
      </Form>

      {/* <Form {...projectForm}>
        <form className="flex w-full flex-col gap-6" onSubmit={onSubmit}>
          <div className="flex w-full flex-col justify-between gap-4 rounded-lg border bg-secondary-background p-4">
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">Client details</h3>

            <FormField
              control={clientForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid w-full grid-cols-5 gap-2">
                  <FormLabel>Name</FormLabel>

                  <FormControl>
                    <Input {...field} onBlur={onSubmit} className="min-w-full" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={clientForm.control}
              name="description"
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
          </div>
        </form>
      </Form> */}
    </section>
  );
};
