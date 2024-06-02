import { api } from "~/trpc/server";
import { Sidebar } from "./Sidebar";
import { Skeleton } from "~/components/ui/skeleton";

export const SidebarWrapperRSC = async () => {
  const data = await api.viewer.getPermissions.query();

  return <Sidebar initialData={data} />;
};

export const SidebarLoading = () => {
  return (
    <div className="flex flex-col  gap-3 px-2 py-4">
      <Skeleton className="h-8 w-full" />

      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>

      <Skeleton className="mt-auto h-8 w-full" />
    </div>
  );
};
