"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { addDays, format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { PiCalendarX, PiInfo, PiMapTrifold, PiXCircle, PiXSquare } from "react-icons/pi";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
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
          {!!row.getValue("identifier") ? (
            row.getValue("identifier")
          ) : (
            <span className="flex items-center gap-1 font-normal text-muted-foreground">
              <PiXSquare size={16} />
              Not set
            </span>
          )}
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
              <p className="max-w-[20ch] justify-start overflow-hidden text-ellipsis whitespace-nowrap px-0 text-sm font-medium text-indigo-500 dark:text-indigo-400 dark:text-indigo-400">
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
    id: "budgetHours",
    header: "Budget hours",
    accessorFn: (row) => row.project.budgetHours,
    cell: ({ row }) => (
      <p
        className={cn(
          "text-muted-foreground",
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
          format(row.getValue("startsAt"), "PPP")
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
    cell: ({ row }) =>
      !!row.getValue("endsAt") ? (
        <span
          className={cn(
            "flex items-center gap-1 font-medium",
            (row.original.project.endsAt ?? new Date()) < new Date()
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
                      addDays(new Date(), 7) >= row.original.project.endsAt
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
      ) : (
        <span className="flex items-center gap-1">
          <PiCalendarX size={16} />
          Not set
        </span>
      ),
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

  const workspace = useWorkspaceStore((s) => s.active);

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

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-secondary-background p-5">
      <div>
        <FormItem>
          <Label>Search</Label>
          <Input
            placeholder="Search projects"
            className="w-1/3"
            onChange={(e) => table.setGlobalFilter(e.currentTarget.value)}
          />
        </FormItem>
      </div>

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
                      className="px-4"
                      style={{
                        maxWidth: `${cell.column.getSize()}px`,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Link
                        href={routes.projectId({
                          slug: workspace?.slug ?? "",
                          id: row.original.projectShareableUrl,
                        })}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Link>
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
