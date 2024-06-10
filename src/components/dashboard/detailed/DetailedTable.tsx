"use client";

import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react";

export const DetailedTable = () => {
  return (
    <div>
      <Table className="my-0 table-fixed">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Group</TableHeaderCell>
            <TableHeaderCell className="text-right"></TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell className="w-40">Time</TableHeaderCell>
            <TableHeaderCell className="w-40">Amount</TableHeaderCell>
            <TableHeaderCell className="w-40">Costs</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableCell>Wilhelm Tell</TableCell>
            <TableCell className="text-right">1</TableCell>
            <TableCell>Uri, Schwyz, Unterwalden</TableCell>
            <TableCell>National Hero</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>The Witcher</TableCell>
            <TableCell className="text-right">129</TableCell>
            <TableCell>Kaedwen</TableCell>
            <TableCell>Legend</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Mizutsune</TableCell>
            <TableCell className="text-right">82</TableCell>
            <TableCell>Japan</TableCell>
            <TableCell>N/A</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
