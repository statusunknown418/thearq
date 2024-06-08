"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Image from "next/image";
import {
  PiArrowSquareOutDuotone,
  PiDotsThreeVerticalBold,
  PiInfinity,
  PiTrash,
} from "react-icons/pi";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { parseCompactCurrency } from "~/lib/parsers";
import { useDetailsSheetStore } from "~/lib/stores/sheets-store";
import { cn } from "~/lib/utils";
import { type Roles } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export type TeamTableData = RouterOutputs["teams"]["getByWorkspace"];

export type TeamTableColumn = RouterOutputs["teams"]["getByWorkspace"]["table"][number];
export const columns: ColumnDef<TeamTableColumn>[] = [
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
          {parseCompactCurrency(row.getValue("defaultBillableRate"))}
        </Badge>
      </span>
    ),
  },
  {
    accessorKey: "defaultInternalCost",
    header: "Internal Cost",
    size: 200,
    minSize: 180,
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        <Badge
          className="text-sm"
          variant={
            row.original.defaultBillableRate < row.original.defaultInternalCost
              ? "destructive"
              : "secondary"
          }
        >
          {parseCompactCurrency(row.getValue("defaultInternalCost"))}
        </Badge>
      </span>
    ),
  },
  {
    id: "actions",
    size: 50,
    cell: ({ row }) => {
      return <RowActions row={row.original} />;
    },
  },
];

const RowActions = ({ row }: { row: TeamTableColumn }) => {
  const utils = api.useUtils();

  const { mutate: removeUser, isLoading } = api.teams.removeUser.useMutation({
    onMutate: async (data) => {
      const snapshot = utils.teams.getByWorkspace.getData();

      if (!snapshot) {
        return;
      }

      const newData = {
        table: snapshot.table.filter((d) => d.userId !== data.userId),
        allowed: snapshot.allowed,
      };

      utils.teams.getByWorkspace.setData(undefined, newData);
      return snapshot;
    },
    onSuccess: async () => {
      toast.success("User removed");
    },
    onError: (err, _vars, ctx) => {
      utils.teams.getByWorkspace.setData(undefined, ctx);

      toast.error("Failed to remove user", {
        description: err.message,
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <PiDotsThreeVerticalBold size={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            removeUser({ userId: row.userId });
          }}
        >
          {isLoading ? <Loader /> : <PiTrash size={16} />}
          Remove user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const TeamTable = ({ data, allowed }: { data: TeamTableData; allowed: boolean }) => {
  const updateDetails = useDetailsSheetStore((s) => s.setDetails);

  const { data: tableData } = api.teams.getByWorkspace.useQuery(undefined, {
    initialData: data,
    suspense: true,
  });

  const table = useReactTable({
    data: tableData.table,
    columns: columns.map((c) => {
      if (c.id === "actions" && !allowed) {
        return {
          ...c,
          cell: () => null,
          accessor: () => null,
        };
      }

      return c;
    }),
    getCoreRowModel: getCoreRowModel<TeamTableColumn>(),
    getFilteredRowModel: getFilteredRowModel(),
    /**
     * TODO: Add sorting per column
     */
    state: {},
  });

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border bg-secondary-background p-5">
      <Input
        placeholder="Find by email"
        value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-hidden rounded-lg border bg-background">
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
                  onClick={() => {
                    !!allowed && updateDetails(row.original);
                  }}
                  className={cn(
                    !!allowed ? "cursor-pointer" : "cursor-not-allowed bg-secondary-background",
                  )}
                >
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

      <div className="flex-1 text-xs text-muted-foreground">
        {data.table.length} teammate{data.table.length === 1 ? "" : "s"} in this workspace
      </div>
    </div>
  );
};
