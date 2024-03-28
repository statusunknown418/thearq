"use client";

import { useRouter } from "next/navigation";
import { routes } from "~/lib/navigation";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { useHotkeys } from "~/lib/use-hotkeys";

export const Hotkeys = () => {
  const workspace = useWorkspaceStore((s) => s.active);

  const setCmdK = useCommandsStore((s) => s.setSearch);
  const setAutoTracker = useCommandsStore((s) => s.setTrack);
  const router = useRouter();

  useHotkeys([
    ["mod + K", () => setCmdK(true)],
    ["A", () => setAutoTracker(true)],
    [
      "shift + D",
      () => {
        if (!workspace?.slug) return;
        router.push(routes.dashboard({ slug: workspace.slug }));
      },
    ],
    [
      "shift + T",
      () => {
        if (!workspace?.slug) return;
        router.push(routes.tracker({ slug: workspace.slug, search: {} }));
      },
    ],
    [
      "shift + A",
      () => {
        if (!workspace?.slug) return;
        router.push(routes.analytics({ slug: workspace.slug }));
      },
    ],
    [
      "shift + Y",
      () => {
        if (!workspace?.slug) return;
        router.push(routes.projects({ slug: workspace.slug }));
      },
    ],
    [
      "shift + I",
      () => {
        if (!workspace?.slug) return;
        router.push(routes.invoices({ slug: workspace.slug }));
      },
    ],
    [
      "shift + P",
      () => {
        if (!workspace?.slug) return;
        router.push(routes.people({ slug: workspace.slug }));
      },
    ],
  ]);

  return <></>;
};
