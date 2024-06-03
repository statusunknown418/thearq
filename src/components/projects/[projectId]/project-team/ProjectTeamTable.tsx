"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Image from "next/image";
import { PiArrowSquareOutDuotone } from "react-icons/pi";
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
import { parseLongCurrency } from "~/lib/parsers";
import { useProjectPersonSheetStore } from "~/lib/stores/sheets-store";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { AddProjectPeople } from "../add-people/AddProjectPeople";
import { useProjectsQS } from "../project-cache";

type ProjectTeamColumn = RouterOutputs["projects"]["getTeam"]["users"][number];
const columns: ColumnDef<ProjectTeamColumn>[] = [
  {
    id: "avatar",
    header: undefined,
    accessorFn: (row) => row.user.image,
    size: 40,
    cell: ({ row }) => (
      <Image
        src={row.getValue("avatar")}
        alt={row.getValue("name")}
        className="ml-2 h-8 w-8 self-center rounded-full"
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
    id: "role",
    accessorFn: (row) => row.role,
    header: "Role",
    cell: ({ row }) => {
      return <Badge variant={"secondary"}>{row.getValue("role")}</Badge>;
    },
  },
  {
    id: "billableRate",
    accessorFn: (row) => row.billableRate,
    header: "Rate",
    cell: ({ row }) => {
      return <Badge variant={"secondary"}>{parseLongCurrency(row.getValue("billableRate"))}</Badge>;
    },
  },
  {
    id: "internalCost",
    accessorFn: (row) => row.internalCost,
    header: "Internal Cost",
    cell: ({ row }) => {
      return <Badge variant={"secondary"}>{parseLongCurrency(row.getValue("internalCost"))}</Badge>;
    },
  },
];

export const ProjectTeamTable = ({
  id,
  initialData,
}: {
  id: string;
  initialData: RouterOutputs["projects"]["getTeam"];
}) => {
  const updateDetails = useProjectPersonSheetStore((s) => s.setData);
  const [_state, set] = useProjectsQS();

  const { data: tableData } = api.projects.getTeam.useQuery(
    {
      projectShareableId: id,
    },
    {
      initialData,
    },
  );

  const table = useReactTable({
    data: tableData?.users ?? [],
    columns,
    getCoreRowModel: getCoreRowModel<ProjectTeamColumn>(),
    getFilteredRowModel: getFilteredRowModel(),
    /**
     * TODO: Add sorting per column
     */
    state: {},
  });

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border bg-secondary-background p-5">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Find by name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <AddProjectPeople projectTeam={initialData} />
      </div>

      <section className="rounded-lg border bg-background">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => {
                    updateDetails(row.original);
                    void set({ user: row.original.userId });
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        maxWidth: `${cell.column.getSize()}px`,
                        width: `${cell.column.getSize()}px`,
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
      </section>

      <div className="flex-1 text-xs text-muted-foreground">
        {initialData.users.length} {initialData.users.length === 1 ? "person" : "people"} assigned
        to this project
      </div>
    </div>
  );
};
