import { Main } from "~/components/layout/Main";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProjectIDLoading() {
  return (
    <Main>
      <Skeleton className="h-24 w-full" />

      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-96 w-full" />
    </Main>
  );
}
