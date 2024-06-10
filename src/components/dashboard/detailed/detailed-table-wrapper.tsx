import { Skeleton } from "~/components/ui/skeleton";
import { DetailedTable } from "./DetailedTable";

export const DetailedTableWrapperRSC = async () => {
  return <DetailedTable />;
};

export const DetailedTableLoading = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
