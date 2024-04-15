"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Image from "next/image";
import { PiArrowSquareOutDuotone, PiInfinity } from "react-icons/pi";
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
import { type Roles } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export type TeamTableData = RouterOutputs["teams"]["getByWorkspace"];

export type TeamTableColumn = RouterOutputs["teams"]["getByWorkspace"][number];
export const columns: ColumnDef<TeamTableColumn>[] = [
  {
    id: "avatar",
    header: undefined,
    accessorFn: (row) => row.user.image,
    cell: ({ row }) => (
      <Image
        src={row.getValue("avatar")}
        alt={row.getValue("name")}
        className="h-8 w-8 self-center rounded-full"
        width={32}
        height={32}
      />
    ),
  },
  {
    id: "name",
    accessorFn: (row) => row.user.name,
    header: "Name",
    cell: ({ row }) => {
      return (
        <Button variant={"link"} className="justify-start px-0 text-sm">
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
    header: () => <span className="text-left">Email</span>,
    cell: ({ row }) => (
      <span className="text-left text-muted-foreground">{row.getValue("email")}</span>
    ),
    maxSize: 250,
  },
  {
    accessorKey: "defaultWeekCapacity",
    header: "Week Capacity",
    cell: ({ row }) => (
      <Badge className="font-mono tabular-nums">
        {row.getValue("defaultWeekCapacity") === null ? (
          <PiInfinity size={16} />
        ) : (
          row.getValue("defaultWeekCapacity")
        )}{" "}
        hours
      </Badge>
    ),
  },
  {
    accessorKey: "defaultBillableRate",
    header: "Billable Rate",
    size: 200,
    minSize: 180,
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        <Badge variant={"secondary"} className="text-sm">
          $ {row.getValue("defaultBillableRate")}
        </Badge>
      </span>
    ),
  },
  {
    accessorKey: "internalCost",
    header: "Internal Cost",
    size: 200,
    minSize: 180,
    cell: ({ row }) => (
      <span className="font-mono  tabular-nums">
        <Badge variant={"secondary"} className="text-sm">
          $ {row.getValue("internalCost")}
        </Badge>
      </span>
    ),
  },
];

export const TeamTable = ({ data }: { data: TeamTableData }) => {
  const updateDetails = useDetailsSheetStore((s) => s.setDetails);

  const { data: tableData } = api.teams.getByWorkspace.useQuery(undefined, {
    initialData: data,
    suspense: true,
  });

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel<TeamTableColumn>(),
    getFilteredRowModel: getFilteredRowModel(),
    /**
     * TODO: Add sorting per column
     */
    state: {},
  });

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border bg-secondary-background p-5">
      <FormItem>
        <Label>Search</Label>
        <Input
          placeholder="Find by email"
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </FormItem>

      <div className="rounded-lg border bg-background p-1">
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
                    <TableCell
                      key={cell.id}
                      onClick={() => {
                        cell.column.id === "name" && updateDetails(row.original);
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

      <div className="flex-1 text-sm text-muted-foreground">
        {data.length} teammate{data.length === 1 ? "" : "s"} in this workspace
      </div>
    </div>
  );
};
