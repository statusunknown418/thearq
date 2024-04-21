"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { PiArrowSquareOutDuotone, PiMapTrifold } from "react-icons/pi";
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
import { useCommandsStore } from "~/lib/stores/commands-store";
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
    accessorFn: (row) => row.identifier,
    cell: ({ row }) => {
      return <span className="font-medium">[{row.getValue("identifier")}]</span>;
    },
  },
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      return (
        <Button variant={"link"} className="justify-start px-0 text-sm">
          {row.getValue("name")} <PiArrowSquareOutDuotone size={16} />
        </Button>
      );
    },
  },
  {
    id: "budget",
    header: "Budget",
    accessorFn: (row) => row.budgetHours,
  },
  {
    id: "startsAt",
    header: "Starts At",
    accessorFn: (row) => row.startsAt,
    cell: ({ row }) => (
      <span className={cn(!!row.getValue("startsAt") && "font-medium")}>
        {!!row.getValue("startsAt") ? formatDate(row.getValue("startsAt"), "PPP") : "Not set"}
      </span>
    ),
  },
  {
    id: "endsAt",
    header: "Ends At",
    accessorFn: (row) => row.endsAt,
    cell: ({ row }) => (
      <span className={cn(!!row.getValue("endsAt") && "font-medium")}>
        {!!row.getValue("endsAt") ? formatDate(row.getValue("endsAt"), "PPP") : "Not set"}
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
    <section className="flex flex-col gap-4 rounded-xl border bg-muted p-5">
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
                      style={{ width: `${cell.column.getSize()}px` }}
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
