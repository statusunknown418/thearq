"use client";

import { useForm } from "react-hook-form";
import { PiUserDuotone } from "react-icons/pi";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { type ClientSchema } from "~/server/db/edge-schema";

export const ProjectClientDetails = () => {
  const form = useForm<ClientSchema>();

  const onSubmit = () => {
    return;
  };

  return (
    <div className="flex flex-col gap-6 rounded-lg border p-4">
      <h3 className="flex items-center gap-2 text-muted-foreground">
        <PiUserDuotone size={16} />
        Client details
      </h3>

      <Form {...form}>
        <form className="flex w-full flex-col gap-4 rounded-lg">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="grid w-full grid-cols-5 gap-2">
                <FormLabel>Name</FormLabel>

                <div className="col-span-4 flex flex-col gap-2">
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Client name"
                    onBlur={onSubmit}
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem className="grid w-full grid-cols-5 gap-2">
                <FormLabel>Email</FormLabel>

                <div className="col-span-4 flex flex-col gap-2">
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="someone@this-company.com"
                    onBlur={onSubmit}
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="address"
            control={form.control}
            render={({ field }) => (
              <FormItem className="grid w-full grid-cols-5 gap-2">
                <FormLabel>Address</FormLabel>

                <div className="col-span-4 flex flex-col gap-2">
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      onBlur={onSubmit}
                      placeholder={"Add a client address (if applicable)"}
                    />
                  </FormControl>

                  <FormDescription>Internal notes, not shared with the client</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
