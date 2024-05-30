"use client";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  PiArrowLeft,
  PiArrowRight,
  PiFloppyDiskDuotone,
  PiFolder,
  PiPlus,
  PiX,
} from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { FormDescription, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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

  const [groupBy, _changeGrouping] = useState<"person" | "project">("person");

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
      step: "notes",
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
      <article className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4">
            <FormItem>
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

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

            <div className="flex min-w-24 flex-col items-end gap-2">
              <Label>Amount</Label>
              <p className="font-semibold tabular-nums">
                {parseLongCurrency(field.quantity * field.unitPrice * 100)}
              </p>
            </div>
          </div>
        ))}

        <Button
          type="button"
          className="max-w-max"
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

  const computeTotal = formContext
    .watch("items")
    ?.map((item) => item.quantity * item.unitPrice)
    .reduce((acc, curr) => acc + curr, 0);

  return (
    <article className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4">
      <section className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4">
            <Button
              className="mt-5"
              variant={"outline"}
              size={"icon"}
              onClick={() => {
                remove(index);
              }}
            >
              <PiX />
            </Button>

            <FormItem className="min-w-40">
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <FormField
              control={formContext.control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem className="max-w-20">
                  <FormLabel>Quantity</FormLabel>

                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={"Quantity"}
                    className="text-right"
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
                <FormItem className="max-w-20">
                  <FormLabel>Unit price</FormLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={"Price"}
                    className="text-right"
                  />
                </FormItem>
              )}
            />

            <div className="flex min-w-24 flex-col items-end gap-2">
              <Label>Amount</Label>
              <p className="font-semibold tabular-nums">
                {parseLongCurrency(field.quantity * field.unitPrice * 100)}
              </p>
            </div>
          </div>
        ))}

        <Button
          className="max-w-max"
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

      <div className="flex flex-col items-end justify-end">
        <p>Total</p>
        <p className="font-semibold tabular-nums">
          {!!computeTotal && parseLongCurrency(computeTotal * 100)}
        </p>
      </div>

      <FormField
        control={formContext.control}
        name="notes"
        render={({ field }) => (
          <FormItem className="mt-4">
            <FormLabel>Notes</FormLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              placeholder={"Notes"}
              className="w-full"
            />
            <FormDescription>
              Add extra notes to the invoice. This will be displayed on the invoice and can be used
              to explain it, or to add any additional information.
            </FormDescription>
          </FormItem>
        )}
      />

      <div className="flex w-full justify-end gap-4">
        <Button variant={"outline"} size={"lg"} type="button" onClick={goToPreviousStep}>
          <PiArrowLeft />
          Previous
        </Button>

        <Button variant={"secondary"} size={"lg"} type="button">
          <PiFolder size={15} />
          Preview
        </Button>

        <Button size={"lg"}>
          <PiFloppyDiskDuotone size={15} />
          Save
        </Button>
      </div>
    </article>
  );
};
