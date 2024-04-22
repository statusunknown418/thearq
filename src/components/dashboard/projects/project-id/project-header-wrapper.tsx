import Link from "next/link";
import { PiArrowLeft, PiWarningOctagonDuotone } from "react-icons/pi";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/server";
import { ProjectHeader } from "./ProjectHeader";

export const ProjectHeaderWrapperRSC = async ({ id }: { id: string; slug: string }) => {
  try {
    const initialData = await api.projects.getDetails.query({ shareableUrl: id });

    return <ProjectHeader initialData={initialData} />;
  } catch (error) {
    return (
      <Main className="flex items-center justify-center gap-3">
        <PiWarningOctagonDuotone size={40} className="text-red-500" />
        <p className="text-muted-foreground">You are not allowed to see this project details</p>
        <Button asChild variant={"secondary"}>
          <Link href={"./"}>
            <PiArrowLeft />
            Go back
          </Link>
        </Button>
      </Main>
    );
  }
};

export const ProjectHeaderLoading = () => {
  return (
    <PageHeader>
      <Button asChild variant={"secondary"} size={"icon"} subSize={"iconLg"}>
        <Link href={"./"}>
          <PiArrowLeft size={20} />
        </Link>
      </Button>

      <div className="flex gap-2">
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-7 w-40" />

          <Skeleton className="h-6 w-80" />
        </div>
      </div>
    </PageHeader>
  );
};
