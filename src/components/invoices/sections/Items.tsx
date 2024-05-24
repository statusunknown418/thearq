"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { type InvoiceSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";

export const ItemsSection = () => {
  const formContext = useFormContext<InvoiceSchema>();

  const { fields } = useFieldArray({
    control: formContext.control,
    name: "items",
  });

  return <article className="flex h-full w-full flex-col gap-6"></article>;
};
