"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { invoicesSchema, type InvoiceSchema } from "~/server/db/edge-schema";
import { Form } from "../ui/form";
import { useInvoicesQS } from "./invoices-cache";
import { Stepper, renderers } from "./sections/Stepper";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export const InvoiceForm = () => {
  const [{ step, client, projects }] = useInvoicesQS();

  const { mutate } = api.invoices.create.useMutation({
    onSuccess: () => {
      toast.success("Invoice created");
    },
    onError: (error) => {
      toast.error("Error creating invoice", {
        description: error.message,
      });
    },
  });

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoicesSchema),
    defaultValues: {
      clientId: client ?? undefined,
      includeHours: "all",
      identifier: "INV-0001",
      currency: "USD",
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

  const onSubmit = form.handleSubmit((data) => {
    mutate(data);
  });

  return (
    <Form {...form}>
      <section className="grid h-full grid-cols-1 gap-4">
        <form className="col-span-3 flex flex-col gap-4" onSubmit={onSubmit}>
          <Stepper />

          {renderers[step as keyof typeof renderers]}
        </form>

        {/* <InvoicePreview /> */}
      </section>
    </Form>
  );
};
