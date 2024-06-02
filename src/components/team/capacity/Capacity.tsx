"use client";
import { Gauge } from "@suyalcinkaya/gauge";
import { Card } from "@tremor/react";
import { type RouterOutputs } from "~/trpc/shared";

export const Capacity = ({ initialData }: { initialData: RouterOutputs["plans"]["getPlan"] }) => {
  const [_plan, workspace] = initialData;

  const usedPercentage = ((workspace?.seatCount ?? 0) / (workspace?.seatLimit ?? 0)) * 100;

  return (
    <Card className="flex flex-col items-center justify-center gap-2 p-5">
      <div className="flex items-center gap-8 px-10">
        <Gauge value={usedPercentage} size="2xl" showAnimation showValue />

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-medium">Capacity</h3>

          <p className="text-xs text-muted-foreground">
            According to the plan you have selected, the amount of seats may vary
          </p>

          <p className="mt-4 text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {workspace?.seatCount}/{workspace?.seatLimit} ({usedPercentage.toFixed(0)}%)
          </p>
          <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Seats in use for this workspace
          </p>
        </div>
      </div>
    </Card>
  );
};
