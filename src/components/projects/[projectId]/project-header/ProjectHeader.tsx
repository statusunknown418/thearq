"use client";
import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { CopyButton } from "~/components/ui/copy-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useSafeParams } from "~/lib/navigation";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { ProjectsRangeSelector } from "../ProjectsRangeSelector";

export const ProjectHeader = ({
  initialData,
}: {
  initialData: RouterOutputs["projects"]["getDetails"];
}) => {
  const params = useSafeParams("projectId");
  const { data } = api.projects.getDetails.useQuery(
    {
      shareableUrl: params.id,
    },
    {
      initialData,
    },
  );

  return (
    <PageHeader className="h-20 max-h-20 min-h-20 gap-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <Button asChild variant={"secondary"} size={"icon"} subSize={"iconBase"}>
              <Link href={"./"}>
                <PiArrowLeft size={16} />
              </Link>
            </Button>
          </TooltipTrigger>

          <TooltipContent>Go back</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <section className="flex w-full flex-col gap-0 pl-4">
        <div className="flex items-center gap-2">
          {!!data?.identifier && <span className="text-muted-foreground">[{data.identifier}]</span>}
          <h2 className="text-lg font-medium">{data?.name}</h2>
        </div>

        <div className="flex h-5 items-center gap-2 text-xs text-muted-foreground">
          {!!data?.client?.name && <span>{data.client.name}</span>}

          {!!data?.client?.name && <span>&middot;</span>}

          <span className="underline-offset-1 hover:underline">
            {process.env.NEXT_PUBLIC_APP_URL}/shared/{data.shareableUrl}
          </span>

          <CopyButton
            className="h-6 w-6"
            text={`${process.env.NEXT_PUBLIC_APP_URL}/shared/${data.shareableUrl}`}
          />
        </div>
      </section>

      <ProjectsRangeSelector />
    </PageHeader>
  );
};
