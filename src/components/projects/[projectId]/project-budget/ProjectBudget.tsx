"use client";
import { Card, ProgressBar } from "@tremor/react";
import { parseNumber } from "~/lib/parsers";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const ProjectBudget = ({
  initialData,
  projectId,
  to,
  from,
}: {
  initialData: RouterOutputs["projects"]["getBudgetRemaining"];
  projectId: string;
  to: string;
  from: string;
}) => {
  const { data } = api.projects.getBudgetRemaining.useQuery(
    {
      projectShareableId: projectId,
      from,
      to,
    },
    {
      initialData,
      refetchOnWindowFocus: false,
    },
  );

  const budgetUsedPercentage =
    data.totalHours > 0 ? 100 - (data.remaining / data.totalBudget) * 100 : 0;

  return (
    <Card className="max-w-xs p-4">
      <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        Budget hours (remaining)
      </h4>
      <p className="mt-1.5 text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {data.totalBudget ? parseNumber(data.remaining) : "N/A"}{" "}
        <span className="text-sm font-normal text-muted-foreground">hours</span>
      </p>
      <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        <span>{data.totalBudget ? `${parseNumber(budgetUsedPercentage)}% used` : "N/A"}</span>
        <span>{data.totalBudget ? `${parseNumber(data.totalBudget)} hours` : "No budget set"}</span>
      </p>

      <ProgressBar value={budgetUsedPercentage} className="mt-2" />
    </Card>
  );
};
