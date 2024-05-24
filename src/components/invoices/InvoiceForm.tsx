"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import { invoicesSchema, type InvoiceSchema } from "~/server/db/edge-schema";
import { Form } from "../ui/form";
import { Stepper, renderers } from "./sections/Stepper";
import { useInvoicesQS } from "./invoices-cache";
import { InvoicePreview } from "./Preview";

export const InvoiceForm = () => {
  const [{ step, client }] = useInvoicesQS();

  const form = useForm<InvoiceSchema>({
    resolver: valibotResolver(invoicesSchema),
    defaultValues: {
      clientId: client ?? undefined,
      includeHours: "all",
      projects: [],
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
