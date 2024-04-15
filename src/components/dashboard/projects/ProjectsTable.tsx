"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { PiArrowSquareOutDuotone, PiMapTrifold } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export type ProjectsTableData = RouterOutputs["projects"]["get"];

export type ProjectsTableColumn = RouterOutputs["projects"]["get"][number];

const columns: ColumnDef<ProjectsTableColumn>[] = [
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
  },
  {
    id: "endsAt",
    header: "Ends At",
    accessorFn: (row) => row.endsAt,
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
    <div className="rounded-lg border bg-background px-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
                  <TableCell key={cell.id}>
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
  );
};

export const ProjectsEmptyState = () => {
  const setCommand = useCommandsStore((s) => s.setCommand);

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-secondary-background p-5">
      <PiMapTrifold size={24} className="text-muted-foreground" />
      <h2 className="text-lg font-bold">No projects found</h2>
      <p className="text-center text-muted-foreground">
        Start by creating a new project, assign members, and set details.
      </p>
      <Button onClick={() => setCommand("new-project")}>Create a project</Button>
    </div>
  );
};
