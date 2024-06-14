import { Main } from "~/components/layout/Main";
import { Skeleton } from "~/components/ui/skeleton";

export default function AppLoader() {
  return (
    <Main className="gap-5 pt-5">
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-8 w-40" />
    </Main>
  );
}
