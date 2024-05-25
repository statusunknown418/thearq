"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { type InvoiceSchema } from "~/server/db/edge-schema";
import { useInvoicesQS } from "../invoices-cache";

export const ItemsSection = () => {
  const [{}, update] = useInvoicesQS();

  const formContext = useFormContext<InvoiceSchema>();
  const { fields } = useFieldArray({
    control: formContext.control,
    name: "items",
  });

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

  return (
    <article className="flex h-full w-full flex-col gap-6">
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
