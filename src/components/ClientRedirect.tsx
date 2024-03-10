"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "~/lib/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";

export const ClientRedirect = () => {
  const workspace = useWorkspaceStore((s) => s.active);
  const router = useRouter();

  useEffect(() => {
    if (workspace?.slug) {
      router.replace(routes.dashboard({ slug: workspace.slug }));
    }
  }, [router, workspace?.slug]);

  return <div />;
};
