import { useFormContext } from "react-hook-form";
import { ClientsCombobox } from "~/components/clients/ClientsCombobox";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SingleDatePicker } from "~/components/ui/single-date-picker";
import { useInvoicesStore } from "~/lib/stores/invoices-store";
import { type ClientSchema, type InvoiceSchema } from "~/server/db/edge-schema";
import { useInvoicesQS } from "../invoices-cache";
import { ProjectsSection } from "./Projects";

export const GeneralSection = () => {
  const [_state, update] = useInvoicesQS();
  const formContext = useFormContext<InvoiceSchema>();

  const storeClient = useInvoicesStore((s) => s.update);

  const onChooseClient = (id: number, data: ClientSchema) => {
    storeClient({ client: data });
    void update({ client: id, projects: [] });
  };

  return (
    <article className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4">
      <h4 className="text-base font-medium text-muted-foreground">Invoice terms</h4>

      <section className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
        <div className="flex w-full max-w-xl flex-col gap-4">
          <ClientsCombobox
            triggerClassnames="max-h-14 flex-row items-center"
            labelClassnames="min-w-24"
            onSelect={onChooseClient}
          />

          <FormField
            control={formContext.control}
            name="identifier"
            render={({ field }) => (
              <FormItem className="flex-row items-center">
                <FormLabel className="min-w-24">Invoice ID</FormLabel>
                <Input {...field} placeholder="ID-777" />
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="subject"
            render={({ field }) => (
              <FormItem className="flex-row items-center">
                <FormLabel className="min-w-24">Subject</FormLabel>
                <Input {...field} value={field.value ?? ""} />
              </FormItem>
            )}
          />
        </div>

        <div className="flex max-w-max flex-col gap-4">
          <FormField
            control={formContext.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="flex-row items-center">
                <FormLabel className="min-w-24">Currency</FormLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="max-w-52">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="taxPercentage"
            render={({ field }) => (
              <FormItem className="flex-row items-center">
                <FormLabel className="min-w-24">Tax (%)</FormLabel>
                <Input {...field} className="max-w-32" />
              </FormItem>
            )}
          />

          <FormField
            control={formContext.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem className="flex-row items-center">
                <FormLabel className="min-w-24">Discount (%)</FormLabel>
                <Input {...field} className="max-w-32" />
              </FormItem>
            )}
          />
        </div>
      </section>

      <div className="flex w-full gap-8">
        <FormField
          control={formContext.control}
          name="createdAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="w-24">Issue Date</FormLabel>
              <SingleDatePicker
                {...field}
                size="lg"
                date={field.value ?? undefined}
                placeholder="Issued at"
                buttonClassName="min-w-52"
              />
            </FormItem>
          )}
        />

        <FormField
          control={formContext.control}
          name="dueAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="w-24">Due Date</FormLabel>
              <SingleDatePicker
                {...field}
                size="lg"
                date={field.value ?? undefined}
                placeholder="Due at"
                buttonClassName="min-w-52"
              />
            </FormItem>
          )}
        />
      </div>

      <ProjectsSection />
    </article>
  );
};
