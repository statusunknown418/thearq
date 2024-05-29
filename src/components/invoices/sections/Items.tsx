"use client";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { PiArrowLeft, PiArrowRight, PiPlus, PiX } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { secondsToHoursDecimal } from "~/lib/dates";
import { parseLongCurrency, receiveAmount } from "~/lib/parsers";
import { type InvoiceSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { useInvoicesQS } from "../invoices-cache";

export const ItemsSection = () => {
  const [{ projects }, update] = useInvoicesQS();

  const [groupBy, changeGrouping] = useState<"person" | "project">("person");

  const formContext = useFormContext<InvoiceSchema>();
  const { fields, append, replace, remove } = useFieldArray({
    control: formContext.control,
    name: "items",
  });

  const { data, isLoading } = api.entries.getNonInvoiced.useQuery(
    {
      selection: formContext.getValues("includeHours"),
      projectIds: projects,
    },
    {
      refetchOnReconnect: false,
    },
  );

  const groupedData = useMemo(() => {
    if (!data) {
      return null;
    }

    if (groupBy === "person") {
      const byPerson = data?.reduce(
        (acc, curr) => {
          const selection = acc[curr.userId];

          if (!selection) {
            acc[curr.userId] = {
              hours: 0,
              amount: 0,
            };
          }

          acc[curr.userId]!.hours += curr.duration;

          const userRate =
            curr.project?.users.find((u) => u.userId === curr.userId)?.billableRate ?? 0;

          acc[curr.userId]!.amount += userRate * secondsToHoursDecimal(curr.duration);

          return acc;
        },
        {} as Record<
          string,
          {
            hours: number;
            amount: number;
          }
        >,
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
          acc[key] = {
            hours: 0,
            amount: 0,
          };
        }

        acc[key]!.hours += curr.duration;

        return acc;
      },
      {} as Record<
        string,
        {
          hours: number;
          amount: number;
        }
      >,
    );

    return Object.entries(byProject).map(([key, value]) => ({
      key,
      value,
    }));
  }, [data, groupBy]);

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

  useEffect(() => {
    if (!!data?.length && !!groupedData?.length) {
      if (fields.length === 1) {
        replace(
          groupedData.map((entry) => ({
            description: entry.key,
            quantity: secondsToHoursDecimal(entry.value.hours),
            unitPrice: receiveAmount(entry.value.amount),
          })),
        );
      }
    }
  }, [append, data, data?.length, fields.length, groupedData, replace]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!data) {
    return <p>No data</p>;
  }

  if (data.length === 0) {
    return (
      <article className="flex h-full w-full flex-col gap-6">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={formContext.control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={"Quantity"}
                    className="max-w-20"
                  />
                </FormItem>
              )}
            />

            <FormField
              control={formContext.control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder={"Description"}
                    className="w-full"
                  />
                </FormItem>
              )}
            />

            <FormField
              control={formContext.control}
              name={`items.${index}.unitPrice`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={"Price"}
                    className="max-w-20"
                  />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <p>Amount</p>
              <p>{field.quantity * field.unitPrice}</p>
            </div>
          </div>
        ))}

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
  }

  return (
    <article className="flex h-full w-full flex-col gap-4">
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

      <section>
        <ul className="flex items-center justify-between gap-2 rounded-sm bg-secondary p-2.5 text-right text-xs">
          <li className="w-8"></li>
          <li className="min-w-20 text-left">Quantity</li>
          <li className="max-w-[420px] flex-grow text-left">Description</li>
          <li className="min-w-20">Price</li>
          <li className="min-w-20">Amount</li>
        </ul>

        <div className="my-2 flex flex-col gap-2">
          {fields.map((field, index) => (
            <article key={field.id} className="flex gap-2">
              <Button
                variant={"outline"}
                size={"icon"}
                onClick={() => {
                  remove(index);
                }}
              >
                <PiX />
              </Button>

              <FormField
                control={formContext.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={"Quantity"}
                    className="max-w-20 text-right"
                  />
                )}
              />

              <FormField
                control={formContext.control}
                name={`items.${index}.description`}
                render={({ field }) => (
                  <div className="max-w-[420px] flex-grow">
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder={"Description"}
                      className="w-full"
                    />
                  </div>
                )}
              />

              <FormField
                control={formContext.control}
                name={`items.${index}.unitPrice`}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={"Price"}
                    className="max-w-20 text-right"
                  />
                )}
              />

              <p className="w-max min-w-20 text-right text-sm font-medium tabular-nums">
                {parseLongCurrency(field.quantity * field.unitPrice * 100)}
              </p>
            </article>
          ))}
        </div>

        <Button
          type="button"
          variant={"secondary"}
          onClick={() => {
            append({
              description: "",
              quantity: 1,
              unitPrice: 0,
            });
          }}
        >
          <PiPlus />
          Add item
        </Button>
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
