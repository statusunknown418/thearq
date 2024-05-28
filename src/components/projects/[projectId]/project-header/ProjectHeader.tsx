"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PiArrowLeft } from "react-icons/pi";
import { toast } from "sonner";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { CopyButton } from "~/components/ui/copy-button";
import { Form, FormDescription, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useSafeParams } from "~/lib/navigation";
import { projectsSchema, type ProjectSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { ProjectsRangeSelector } from "../ProjectsRangeSelector";

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
      id: data?.id,
      name: data?.name,
    },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  return (
    <Form {...form}>
      <PageHeader className="gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <Button asChild variant={"secondary"} size={"icon"} subSize={"iconLg"}>
                <Link href={"./"}>
                  <PiArrowLeft size={16} />
                </Link>
              </Button>
            </TooltipTrigger>

            <TooltipContent>Go back</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <section className="-mt-1 flex w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full gap-0">
                  <Input
                    variant={"ghost"}
                    className="w-full max-w-3xl text-xl font-bold"
                    {...field}
                    onBlur={onSubmit}
                  />

                  <FormDescription className="ml-3 flex items-center gap-2 text-sm">
                    {!!data?.identifier && <span>[{data.identifier}]</span>}

                    {!!data.identifier && <span>&middot;</span>}

                    {!!data?.client?.name && <span>{data.client.name}</span>}

                    {!!data?.client?.name && <span>&middot;</span>}

                    <span className="underline-offset-1 hover:underline">
                      {process.env.NEXT_PUBLIC_APP_URL}/shared/{data.shareableUrl}
                    </span>

                    <CopyButton
                      className="h-7 w-7"
                      text={`${process.env.NEXT_PUBLIC_APP_URL}/shared/${data.shareableUrl}`}
                    />
                  </FormDescription>
                </FormItem>
              )}
            />
          </section>

          <input type="submit" className="hidden" />
        </form>

        <ProjectsRangeSelector />
      </PageHeader>
    </Form>
  );
};
