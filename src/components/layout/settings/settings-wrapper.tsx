import { api } from "~/trpc/server";
import { SettingsNav } from "./SettingsNav";
import { Skeleton } from "~/components/ui/skeleton";

export const SettingsWrapperRSC = async () => {
  const data = await api.viewer.getPermissions.query();

  return <SettingsNav role={data.role} />;
};

export const SettingsLoading = () => {
  return (
    <div className="flex w-[200px] flex-col gap-3 border-r px-2 py-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
};
