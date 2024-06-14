"use client";

import { useState } from "react";
import { PiBuilding, PiKanbanFill, PiLink, PiUserFill } from "react-icons/pi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useDashboardQS } from "../dashboard-cache";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

export type MainGroup = "project" | "client" | "teammate";
export type SubGroup = "teammate" | "project" | "integration";

export const DetailedTable = () => {
  const [mainGroup, setMainGroup] = useState<MainGroup>("project");
  const [subGroup, setSubGroup] = useState<SubGroup>("teammate");

  const [state] = useDashboardQS();
  const { data } = api.entries.getGroupedTable.useQuery({
    from: state.from,
    to: state.to,
    mainGroup,
    subGroup,
  });

  return (
    <section className="grid grid-cols-1 gap-4">
      <ul className="flex h-8 max-w-max items-center gap-2 rounded-md border border-dashed bg-secondary">
        <li className="flex w-max items-center gap-2 pl-3">
          <p className="min-w-max text-xs text-muted-foreground"> Group by</p>

          <Select
            value={mainGroup}
            onValueChange={(v) => {
              if (v === "teammate") {
                setSubGroup("integration");
              }

              setMainGroup(v as MainGroup);
            }}
          >
            <SelectTrigger
              hideIndicator
              className="h-8 rounded-none border-dashed bg-background hover:bg-secondary"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="project">
                <PiKanbanFill className="text-muted-foreground" />
                <span>project</span>
              </SelectItem>
              <SelectItem value="client">
                <PiBuilding />
                client
              </SelectItem>
              <SelectItem value="teammate">
                <PiUserFill className="text-muted-foreground" />
                teammate
              </SelectItem>
            </SelectContent>
          </Select>
        </li>

        <li className="text-xs text-muted-foreground">and</li>

        <li>
          <Select value={subGroup} onValueChange={(v) => setSubGroup(v as SubGroup)}>
            <SelectTrigger
              hideIndicator
              className="h-8 rounded-none rounded-r-md border-r-0 border-dashed bg-background hover:bg-secondary"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="client">
                <PiBuilding />
                client
              </SelectItem>
              <SelectItem value="teammate" disabled={mainGroup === "teammate"}>
                <PiUserFill className="text-muted-foreground" />
                teammate
              </SelectItem>
              <SelectItem value="integration">
                <PiLink />
                integration
              </SelectItem>
            </SelectContent>
          </Select>
        </li>
      </ul>

      <section className="grid w-full grid-cols-1 gap-4">
        <ul className="flex items-center justify-between">
          {data?.tableHeaders.map((h) => (
            <li
              key={h.id}
              className={cn(
                "w-full border px-4 py-2 text-muted-foreground first:rounded-l-sm first:!border-l last:rounded-r-sm odd:border-x-0",
              )}
            >
              {h.name}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
};
