"use client";
import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { useSafeParams } from "~/lib/navigation";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

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
    <PageHeader>
      <Button asChild variant={"secondary"} size={"icon"} subSize={"iconLg"}>
        <Link href={"./"}>
          <PiArrowLeft size={20} />
        </Link>
      </Button>

      <section className="flex gap-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold">{data?.project.name}</h1>

          <p className="text-muted-foreground">{data?.project.description}</p>
        </div>
      </section>
    </PageHeader>
  );
};
