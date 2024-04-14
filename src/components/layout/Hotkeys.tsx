"use client";

import { useRouter } from "next/navigation";
import { routes } from "~/lib/navigation";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { useEventsStore } from "~/lib/stores/events-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { useHotkeys } from "~/lib/use-hotkeys";
import { ProjectCommand } from "../dashboard/projects/ProjectCommand";
import { TrackerCommand } from "../dashboard/tracker/TrackerCommand";

export const Hotkeys = () => {
  const router = useRouter();

  const workspace = useWorkspaceStore((s) => s.active);

  const setOpened = useCommandsStore((s) => s.setCommand);
  const selectedEvent = useCommandsStore((s) => s.defaultValues);
  const opened = useCommandsStore((s) => s.opened);

  const defaultEvent = useEventsStore((s) => s.temporalEvents[0]);

  useHotkeys([
    ["mod + K", () => setOpened("search")],
    ["A", () => setOpened("auto-tracker")],
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
    [
      "mod + shift + Y",
      () => {
        setOpened("new-project");
      },
    ],
  ]);

  return (
    <>
      {opened === "auto-tracker" && (
        <TrackerCommand defaultValues={defaultEvent ?? selectedEvent} />
      )}

      {opened === "new-project" && <ProjectCommand />}
    </>
  );
};
