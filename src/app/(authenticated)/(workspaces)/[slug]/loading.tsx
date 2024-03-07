import { Skeleton } from "~/components/ui/skeleton";

export default function AppLoader() {
  return (
    <section className="grid grid-cols-1 gap-5">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-8 w-40" />
    </section>
  );
}
