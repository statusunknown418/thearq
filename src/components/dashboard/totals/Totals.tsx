"use client";

import { Card, CategoryBar, Legend, List, ListItem } from "@tremor/react";
import { format, toDate } from "date-fns-tz";
import Link from "next/link";
import { PiArrowRight, PiBoundingBox, PiTrendDownBold, PiTrendUpBold } from "react-icons/pi";
import { secondsToHoursDecimal } from "~/lib/dates";
import { parseCompactCurrency, parseLongCurrency, parseNumber } from "~/lib/parsers";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { Button } from "../../ui/button";
import { useDashboardQS } from "../dashboard-cache";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";

export const Totals = ({ initialData }: { initialData: RouterOutputs["entries"]["getTotals"] }) => {
  const [state] = useDashboardQS();
  const workspace = useWorkspaceStore((s) => s.active);

  const { data } = api.entries.getTotals.useQuery(
    {
      from: state.from,
      to: state.to,
    },
    {
      initialData,
    },
  );

  if (!data) {
    return <div>Something happened, please try again later</div>;
  }

  const revenue = data.totalEarnings - data.totalInternalCost;
  const profitPercentage = (revenue / data.totalEarnings) * 100;

  return (
    <>
      <p className="text-xs text-muted-foreground">
        Data from {format(toDate(state.from), "PPP")} to {format(toDate(state.to), "PPP")} across
        all projects, clients and teammates.
      </p>

      <section className="flex gap-4">
        <Card decoration="left" className="relative flex h-48 max-w-md flex-col gap-2">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Earnings</p>
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                data.totalEarnings > data.totalInternalCost ? "text-emerald-500" : "text-red-500",
              )}
            >
              {data.totalEarnings > data.totalInternalCost ? (
                <PiTrendUpBold size={15} />
              ) : (
                <PiTrendDownBold size={15} />
              )}

              {`${isNaN(profitPercentage) ? "N/A" : `${parseNumber(profitPercentage)}%`} `}

              {data.totalInternalCost > data.totalEarnings ? "loss" : "profit"}
            </p>
          </div>

          <div className="flex items-end gap-2">
            <h2 className="text-tremor-metric">{parseLongCurrency(revenue)}</h2>
            <h3 className="mb-1 text-muted-foreground">
              {parseLongCurrency(data.totalEarnings)} <span className="text-xs">gross revenue</span>
            </h3>
          </div>

          <CategoryBar
            showAnimation
            showLabels={false}
            className="mt-4 w-full"
            colors={["emerald", "red"]}
            values={[data.totalEarnings / 100, data.totalInternalCost / 100]}
          />

          <div className="flex items-end justify-between">
            <Legend
              className="mt-2"
              colors={["emerald", "red"]}
              categories={[
                `${parseCompactCurrency(revenue)} earned`,
                `${parseCompactCurrency(data.totalInternalCost)} spent`,
              ]}
            />
          </div>
        </Card>

        <Card className="flex max-w-md flex-col gap-2">
          <h2 className="text-muted-foreground">Tracked time</h2>

          <p className="flex gap-1 text-tremor-metric">
            <span>{secondsToHoursDecimal(data.totalTime)}</span>
            <span className="mb-1 self-end text-sm text-muted-foreground">hours</span>
          </p>

          <CategoryBar
            showAnimation
            showLabels={false}
            className="mt-4 w-full"
            colors={["blue", "yellow"]}
            values={[data.totalTime / 100, data.nonBillableTime / 100]}
          />

          <Legend
            className="mt-2"
            colors={["blue", "yellow"]}
            categories={[
              `${secondsToHoursDecimal(data.totalTime).toFixed(2)} billable time`,
              `${secondsToHoursDecimal(data.nonBillableTime).toFixed(2)} non billable time`,
            ]}
          />
        </Card>

        <Card className="flex min-w-[33%] max-w-xs flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground">Top projects</h2>

            <Button asChild variant={"link"}>
              <Link href={`/${workspace?.slug}/projects`}>
                See all
                <PiArrowRight />
              </Link>
            </Button>
          </div>

          <List className="mt-0 h-full">
            {data.groupedByProject.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-xs">
                <PiBoundingBox size={16} />
                <p>No projects found</p>
              </div>
            )}

            {data.groupedByProject.map((p) => (
              <ListItem key={p.id} className="h-8">
                <div className="flex items-center gap-1">
                  <div
                    className="mr-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color || "#000" }}
                  />
                  <p>{p.project}</p>
                  <p className="text-base">&middot;</p>
                  <p>{p.client ?? "No client"}</p>
                </div>

                <span className="text-foreground">
                  {secondsToHoursDecimal(p.duration).toFixed(2)} h
                </span>
              </ListItem>
            ))}
          </List>
        </Card>
      </section>
    </>
  );
};
