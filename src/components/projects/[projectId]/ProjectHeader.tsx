"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PiArrowLeft, PiUserCircleMinus } from "react-icons/pi";
import { toast } from "sonner";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useSafeParams } from "~/lib/navigation";
import { projectsSchema, type ProjectSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const ProjectHeader = ({
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
      name: data?.project.name,
      description: data?.project.description,
      id: data?.project.id,
    },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  return (
    <PageHeader className="items-start gap-2 pb-4">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <Button asChild variant={"secondary"} size={"icon"} subSize={"iconLg"} className="mt-1">
              <Link href={"./"}>
                <PiArrowLeft size={16} />
              </Link>
            </Button>
          </TooltipTrigger>

          <TooltipContent>Go back</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Form {...form}>
        <form className="flex w-full max-w-3xl flex-col" onSubmit={onSubmit}>
          <section className="flex flex-col">
            <div className="flex items-center gap-2 pl-3">
              <div className="h-4 w-4 rounded-full bg-indigo-500" />
              {data.project.client?.name ? (
                <span>{data.project.client.name}</span>
              ) : (
                <p className="flex items-center gap-1 rounded-sm border p-1 text-xs text-muted-foreground">
                  <PiUserCircleMinus />
                  No client
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <Input
                  variant={"ghost"}
                  className="w-full max-w-3xl text-xl font-bold"
                  {...field}
                  onBlur={onSubmit}
                />
              )}
            />
          </section>

          {/* <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <Textarea
                variant={"ghost"}
                className="max-w-3xl resize-none py-1 text-muted-foreground"
                {...field}
                value={field.value ?? "No description"}
                onBlur={onSubmit}
                rows={2}
                maxRows={4}
              />
            )}
          /> */}

          <input type="submit" className="hidden" />
        </form>
      </Form>
    </PageHeader>
  );
};
