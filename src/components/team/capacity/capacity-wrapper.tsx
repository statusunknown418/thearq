import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/server";
import { Capacity } from "./Capacity";

export const CapacityWrapperRSC = async () => {
  const data = await api.plans.getPlan.query();

  return <Capacity initialData={data} />;
};

export const CapacityLoading = () => {
  return (
    <div className="flex flex-col p-4">
      <Skeleton className="h-20 w-full" />
    </div>
  );
};
