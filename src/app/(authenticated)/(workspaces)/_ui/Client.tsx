"use client";

import { Loader } from "~/components/ui/loader";
import { useSafeParams } from "~/lib/navigation";
import { api } from "~/trpc/react";

export const Client = () => {
  const { slug } = useSafeParams("insights");
  const { data } = api.workspaces.getPermissions.useQuery({ slug });

  return (
    <div>
      Come on please work
      {data ? JSON.stringify(data) : <Loader />}
    </div>
  );
};
