"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { addDays, formatDistanceToNow } from "date-fns";
import { format, toDate } from "date-fns-tz";
import { useRouter } from "next/navigation";
import {
  PiArrowsClockwiseBold,
  PiCalendarX,
  PiInfo,
  PiMapTrifold,
  PiXCircle,
  PiXSquare,
} from "react-icons/pi";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { NOW } from "~/lib/dates";
import { routes } from "~/lib/navigation";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export type ProjectsTableData = RouterOutputs["projects"]["get"];

export type ProjectsTableColumn = RouterOutputs["projects"]["get"][number];

const columns: ColumnDef<ProjectsTableColumn>[] = [
  {
    id: "identifier",
    header: "Identifier",
    size: 20,
    maxSize: 20,
    accessorFn: (row) => row.project.identifier,
    cell: ({ row }) => {
      return (
        <p className="font-medium">
          {!!row.getValue("identifier") ? row.getValue("identifier") : ""}
        </p>
      );
    },
  },
  {
    id: "name",
    header: "Name",
    maxSize: 200,
    accessorFn: (row) => row.project.name,
    cell: ({ row }) => {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="max-w-[20ch] justify-start overflow-hidden text-ellipsis whitespace-nowrap px-0 text-sm font-medium text-indigo-500 dark:text-indigo-400">
                {row.getValue("name")}
              </p>
            </TooltipTrigger>

            <TooltipContent align="start">{row.getValue("name")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "client",
    header: "client",
    maxSize: 200,
    accessorFn: (row) => row.project.client?.name,
    cell: ({ row }) => {
      if (!row.original.project.client) {
        return (
          <span className="flex items-center gap-1 font-normal text-muted-foreground">
            <PiXSquare size={16} />
            No client
          </span>
        );
      }

      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="min-w-max max-w-[20ch] justify-start overflow-hidden text-ellipsis whitespace-nowrap px-0 text-sm font-medium text-emerald-500 dark:text-emerald-400">
                {row.original.project.client?.name ?? "No client"}
              </p>
            </TooltipTrigger>

            <TooltipContent align="start">
              {row.original.project.client?.name ?? "No client"} -{" "}
              {row.original.project.client?.email ?? "No client email"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "budgetHours",
    header: "Budget hours",
    accessorFn: (row) => row.project.budgetHours,
    cell: ({ row }) => (
      <p
        className={cn(
          "flex items-center gap-1 text-muted-foreground",
          !!row.getValue("budgetHours") && "font-medium text-foreground",
        )}
      >
        {!!row.original.project.budgetHours ? (
          `${row.original.project.budgetHours} hours`
        ) : (
          <span className="flex items-center gap-1">
            <PiXCircle size={16} />
            Not set
          </span>
        )}

        {!!row.original.project.budgetResetsPerMonth && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <PiArrowsClockwiseBold className="text-blue-500 dark:text-blue-400" size={16} />
              </TooltipTrigger>

              <TooltipContent>Budget resets every month</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </p>
    ),
  },
  {
    id: "type",
    header: "Billing type",
    accessorFn: (row) => row.project.type,
    cell: ({ row }) => (
      <Badge
        variant={row.original.project.type === "hourly" ? "default" : "secondary"}
        className="text-xs font-normal"
      >
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    id: "startsAt",
    header: "Starts At",
    accessorFn: (row) => row.project.startsAt,
    cell: ({ row }) => (
      <span
        className={cn(
          "text-muted-foreground",
          !!row.getValue("startsAt") && "font-medium text-foreground",
        )}
      >
        {!!row.getValue("startsAt") ? (
          format(toDate(row.getValue("startsAt")), "PPP")
        ) : (
          <span className="flex items-center gap-1">
            <PiCalendarX size={16} />
            Not set
          </span>
        )}
      </span>
    ),
  },
  {
    id: "endsAt",
    header: "Ends At",
    accessorFn: (row) => row.project.endsAt,
    cell: ({ row }) => {
      if (!row.original.project.endsAt) {
        return (
          <span className="flex items-center gap-1 text-muted-foreground">
            <PiCalendarX size={16} />
            Not set
          </span>
        );
      }

      return (
        <span
          className={cn(
            "flex items-center gap-1 font-medium",
            (row.original.project.endsAt ?? toDate(NOW)) < toDate(NOW)
              ? "text-orange-500"
              : "text-muted-foreground",
          )}
        >
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <PiInfo
                  size={16}
                  className={cn(
                    !!row.original.project.endsAt &&
                      addDays(toDate(new Date()), 7) >= row.original.project.endsAt
                      ? "text-orange-500"
                      : "text-blue-500",
                  )}
                />

                {format(row.getValue("endsAt"), "PPP")}
              </TooltipTrigger>

              <TooltipContent>
                Expected to end {formatDistanceToNow(row.getValue("endsAt"), { addSuffix: true })}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      );
    },
  },
];

export const ProjectsTable = ({
  initialData,
}: {
  initialData: RouterOutputs["projects"]["get"];
}) => {
  const { data: projects } = api.projects.get.useQuery(undefined, {
    initialData,
  });

  const router = useRouter();

  const workspace = useWorkspaceStore((s) => s.active);
  const shouldSeeDetails = projects.some((p) => p.role === "admin");

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel<ProjectsTableColumn>(),
    getFilteredRowModel: getFilteredRowModel(),
    /**
     * TODO: Add sorting per column
     */
    state: {},
  });

  if (projects.length === 0) {
    return <ProjectsEmptyState />;
  }

  const onRowClick = (row: ProjectsTableColumn) => {
    if (!shouldSeeDetails) {
      return;
    }

    void router.push(
      routes.projectId({
        slug: workspace?.slug ?? "",
        id: row.project.shareableUrl,
      }),
    );
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-secondary-background p-5">
      <Input
        placeholder="Search projects"
        className="w-1/3"
        onChange={(e) => table.setGlobalFilter(e.currentTarget.value)}
      />

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="text-sm">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={() => onRowClick(cell.row.original)}
                      className={cn(
                        "px-4",
                        shouldSeeDetails ? "cursor-pointer" : "cursor-not-allowed",
                      )}
                      style={{
                        maxWidth: `${cell.column.getSize()}px`,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex-1 text-xs text-muted-foreground">
        {projects.length} project{projects.length === 1 ? "" : "s"} in this workspace
      </div>
    </section>
  );
};

export const ProjectsEmptyState = () => {
  const setCommand = useCommandsStore((s) => s.setCommand);

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-secondary-background px-5 py-10">
      <PiMapTrifold size={24} className="text-muted-foreground" />
      <h2 className="text-lg font-bold">No projects found</h2>
      <p className="text-center text-muted-foreground">
        Start by creating a new project, assign members, and set details.
      </p>
      <Button onClick={() => setCommand("new-project")}>Create a project</Button>
    </div>
  );
};
