"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { addMonths } from "date-fns";
import { useForm } from "react-hook-form";
import { invoicesSchema, type InvoiceSchema } from "~/server/db/edge-schema";
import { Form } from "../ui/form";
import { InvoicePreview } from "./Preview";
import { useInvoicesQS } from "./invoices-cache";
import { Stepper, renderers } from "./sections/Stepper";

export const InvoiceForm = () => {
  const [{ step, client }] = useInvoicesQS();

  const form = useForm<InvoiceSchema>({
    resolver: valibotResolver(invoicesSchema),
    defaultValues: {
      clientId: client ?? undefined,
      includeHours: "all",
      identifier: "INV-0001",
      projects: [],
      createdAt: new Date(),
      dueAt: addMonths(new Date(), 1),
    },
  });

  return (
    <Form {...form}>
      <section className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
        <form className="flex max-h-max flex-col gap-4">
          <Stepper />

          {renderers[step as keyof typeof renderers]}
        </form>

        <InvoicePreview />
      </section>
    </Form>
  );
};
