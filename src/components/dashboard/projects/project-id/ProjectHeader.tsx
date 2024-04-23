"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PiArrowLeft } from "react-icons/pi";
import { toast } from "sonner";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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

  const { mutate } = api.projects.edit.useMutation({
    onError: (error) => {
      toast.error("Failed to update project", {
        description: error.message,
      });
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
    <PageHeader className="items-start gap-2 pb-1 pt-4">
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
        <form className="flex w-full gap-2" onSubmit={onSubmit}>
          <div className="flex w-full flex-col">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <Input
                  variant={"ghost"}
                  className="w-full text-xl font-bold"
                  {...field}
                  onBlur={onSubmit}
                />
              )}
            />

            <FormField
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
            />
          </div>

          <input type="submit" className="hidden" />
        </form>
      </Form>
    </PageHeader>
  );
};
