"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { type InvoiceSchema } from "~/server/db/edge-schema";
import { useInvoicesQS } from "../invoices-cache";
import { api } from "~/trpc/react";
import { useEffect, useMemo, useState } from "react";
import { User } from "next-auth";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { computeDuration, secondsToHoursDecimal } from "~/lib/dates";

export const ItemsSection = () => {
  const [{ projects }, update] = useInvoicesQS();

  const [groupBy, changeGrouping] = useState<"person" | "project">("person");

  const formContext = useFormContext<InvoiceSchema>();
  const { fields } = useFieldArray({
    control: formContext.control,
    name: "items",
  });

  const { data, isLoading } = api.entries.getNonInvoiced.useQuery({
    selection: formContext.getValues("includeHours"),
    projectIds: projects,
  });

  const groupedData = useMemo(() => {
    if (!data) {
      return null;
    }

    if (groupBy === "person") {
      const byPerson = data?.reduce(
        (acc, curr) => {
          const selection = acc[curr.userId];

          if (!selection) {
            acc[curr.userId] = 0;
          }

          acc[curr.userId] += curr.duration;

          return acc;
        },
        {} as Record<string, number>,
      );

      return Object.entries(byPerson).map(([key, value]) => ({
        key,
        value,
      }));
    }

    const byProject = data?.reduce(
      (acc, curr) => {
        const key = curr.projectId;

        if (!key) {
          return acc;
        }

        if (!acc[key]) {
          acc[key] = 0;
        }

        acc[key] += curr.duration;

        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(byProject).map(([key, value]) => ({
      key,
      value,
    }));
  }, [data, groupBy]);

  const team = useMemo(() => {
    if (!data) {
      return null;
    }

    return data.reduce(
      (acc, curr) => {
        const selection = acc[curr.userId];

        if (!selection) {
          acc[curr.userId] = curr.user;
        }

        return acc;
      },
      {} as Record<string, User>,
    );
  }, [data]);

  const goToNextStep = () => {
    void update((prev) => ({
      ...prev,
      step: "items",
    }));
  };

  const goToPreviousStep = () => {
    void update((prev) => ({
      ...prev,
      step: "general",
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!data || !team) {
    return <p>No data</p>;
  }

  console.log(groupedData);

  return (
    <article className="flex h-full w-full flex-col gap-6">
      <Select value={groupBy} onValueChange={(v) => changeGrouping(v as "person" | "project")}>
        <SelectTrigger className="max-w-max gap-1">
          Group by
          <SelectValue placeholder={"Group by"} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="person">Person</SelectItem>
          <SelectItem value="project">Project</SelectItem>
        </SelectContent>
      </Select>

      <section className="rounded-lg border p-3">
        {groupedData?.map((person) => (
          <div key={person.key} className="flex items-center gap-2">
            <h2 className="text-muted-foreground">{team[person.key]?.name}</h2>

            <p className="font-medium">{secondsToHoursDecimal(person.value).toFixed(2)} hours</p>
          </div>
        ))}
      </section>

      <div className="flex w-full justify-end gap-4">
        <Button variant={"outline"} size={"lg"} type="button" onClick={goToPreviousStep}>
          <PiArrowLeft />
          Previous
        </Button>

        <Button variant={"outline"} size={"lg"} type="button" onClick={goToNextStep}>
          Next
          <PiArrowRight />
        </Button>
      </div>
    </article>
  );
};
