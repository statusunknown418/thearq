import { useFormContext } from "react-hook-form";
import { ClientsCombobox } from "~/components/clients/ClientsCombobox";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { SingleDatePicker } from "~/components/ui/single-date-picker";
import { Textarea } from "~/components/ui/textarea";
import { type InvoiceSchema } from "~/server/db/edge-schema";
import { ProjectsSection } from "./Projects";
import { useInvoicesQS } from "../invoices-cache";

export const GeneralSection = () => {
  const [_state, update] = useInvoicesQS();
  const formContext = useFormContext<InvoiceSchema>();

  return (
    <article className="flex h-full w-full flex-col gap-5">
      <section className="grid grid-cols-1 gap-4">
        <h4 className="text-base font-medium text-muted-foreground">Invoice terms</h4>

        <div className="grid grid-cols-5 gap-4">
          <FormField
            control={formContext.control}
            name="subject"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Subject</FormLabel>
                <Input {...field} value={field.value ?? ""} className="w-full" />
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice ID</FormLabel>
                <Input {...field} className="w-full" placeholder="ID-777" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={formContext.control}
            name="createdAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <SingleDatePicker
                  {...field}
                  size="lg"
                  date={field.value ?? undefined}
                  placeholder="Issued at"
                  buttonClassName="justify-start"
                />
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="dueAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <SingleDatePicker
                  {...field}
                  size="lg"
                  date={field.value ?? undefined}
                  placeholder="Due at"
                  buttonClassName="justify-start"
                />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <h4 className="text-base font-medium text-muted-foreground">Client details</h4>

        <div className="grid grid-cols-2 gap-4">
          <ClientsCombobox
            triggerClassnames="max-h-14"
            onSelect={(clientId) => {
              void update({ client: clientId });
            }}
          />

          <FormField
            control={formContext.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <Textarea maxRows={2} {...field} value={field.value ?? ""} className="w-full" />
              </FormItem>
            )}
          />
        </div>
      </section>

      <ProjectsSection />
    </article>
  );
};
