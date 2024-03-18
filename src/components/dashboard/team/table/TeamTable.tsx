"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { PiArrowSquareOutDuotone } from "react-icons/pi";
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
import { useDetailsSheetStore } from "~/lib/stores/sheets-store";
import { cn } from "~/lib/utils";
import { type Roles } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export type TeamTableData = RouterOutputs["workspaces"]["getTeamByWorkspace"];

export type TeamTableColumn = RouterOutputs["workspaces"]["getTeamByWorkspace"][number];
export const columns: ColumnDef<TeamTableColumn>[] = [
  {
    id: "name",
    accessorFn: (row) => row.user.name,
    header: "Name",
    cell: ({ row }) => {
      return (
        <Button variant={"link"} className="justify-start px-0">
          {row.getValue("name")} <PiArrowSquareOutDuotone size={16} />
        </Button>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.getValue<Roles>("role") === "admin" ? "primary" : "secondary"}>
        {row.getValue("role")}
      </Badge>
    ),
  },
  {
    id: "email",
    accessorFn: (row) => row.user.email,
    header: "Email",
    cell: ({ row }) => <span>{row.getValue("email")}</span>,
  },
  {
    accessorKey: "weekCapacity",
    header: "Week Capacity",
    cell: ({ row }) => <span className="tabular-nums">{row.getValue("weekCapacity")}h</span>,
  },
  {
    accessorKey: "billableRate",
    header: "Billable Rate",
    cell: ({ row }) => (
      <Badge variant={"secondary"} className="min-w-[5ch] font-mono text-sm tabular-nums">
        $ {row.getValue("billableRate")}
      </Badge>
    ),
  },
  {
    accessorKey: "internalCost",
    header: "Internal Cost",
    cell: ({ row }) => (
      <Badge variant={"secondary"} className="min-w-[5ch] font-mono text-sm tabular-nums">
        $ {row.getValue("internalCost")}
      </Badge>
    ),
  },
];

export const TeamTable = ({ data }: { data: TeamTableData }) => {
  const updateDetails = useDetailsSheetStore((s) => s.setDetails);

  const { data: tableData } = api.workspaces.getTeamByWorkspace.useQuery(undefined, {
    initialData: data,
    suspense: true,
  });

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel<TeamTableColumn>(),
  });

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border bg-secondary-background p-5">
      <FormItem>
        <Label>Search</Label>
        <Input placeholder="Find by email" />
      </FormItem>

      <p className="text-xs">
        {data.length} teammate{data.length === 1 ? "" : "s"} in this workspace
      </p>

      <div className="rounded-lg border bg-background p-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(header.id === "name" ? "text-left" : "")}
                  >
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => updateDetails(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.id === "name" ? "text-left" : "")}
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
    </div>
  );
};
