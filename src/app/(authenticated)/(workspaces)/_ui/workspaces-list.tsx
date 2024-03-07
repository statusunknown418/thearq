import { CubeIcon } from "@radix-ui/react-icons";
import { APP_URL } from "~/lib/constants";
import { api } from "~/trpc/server";
import { List } from "./List";

export const WorkspacesList = async () => {
  const workspaces = await api.workspaces.get.query();

  if (!workspaces.length) {
    return (
      <div className="flex items-center gap-4 rounded-md border bg-base-200 p-4 text-xs text-muted-foreground">
        <CubeIcon className="h-7 min-w-7 animate-pulse text-primary" />
        <p>You don&apos;t belong to any workspaces nor have you created one 😢</p>
      </div>
    );
  }

  return <List workspaces={workspaces} baseUrl={APP_URL.replace(new RegExp(/https:\/\//), "")} />;
};
