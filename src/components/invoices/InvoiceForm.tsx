"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import { invoicesSchema, type InvoiceSchema } from "~/server/db/edge-schema";
import { Form } from "../ui/form";
import { InvoicePreview } from "./Preview";
import { useInvoicesQS } from "./invoices-cache";
import { Stepper, renderers } from "./sections/Stepper";

export const InvoiceForm = () => {
  const [{ step, client, projects }] = useInvoicesQS();

  const form = useForm<InvoiceSchema>({
    resolver: valibotResolver(invoicesSchema),
    defaultValues: {
      clientId: client ?? undefined,
      includeHours: "all",
      identifier: "INV-0001",
      projects,
      createdAt: new Date(),
      items: [
        {
          description: "Development",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    },
  });

  return (
    <Form {...form}>
      <section className="grid h-full grid-cols-1 gap-4 lg:grid-cols-5">
        <form className="col-span-3 flex max-h-max flex-col gap-4">
          <Stepper />

          {renderers[step as keyof typeof renderers]}
        </form>

        <InvoicePreview />
      </section>
    </Form>
  );
};
