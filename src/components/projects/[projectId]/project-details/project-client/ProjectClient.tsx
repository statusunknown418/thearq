"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PiArrowLeft, PiTriangleDuotone, PiUserCircleDashed, PiUserDuotone } from "react-icons/pi";
import { Badge } from "~/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { type ClientSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const ProjectClientDetails = ({
  initialData,
  projectId,
}: {
  initialData: RouterOutputs["clients"]["getByProject"];
  projectId: string;
}) => {
  const { data } = api.clients.getByProject.useQuery(
    {
      shareableId: projectId,
    },
    {
      initialData,
    },
  );

  const form = useForm<ClientSchema>({
    defaultValues: {
      name: data?.name,
      email: data?.email,
      address: data?.address,
    },
  });

  useEffect(() => {
    form.reset({
      name: data?.name,
      email: data?.email,
      address: data?.address,
    });
  }, [data?.address, data?.email, data?.name, form]);

  const onSubmit = () => {
    return;
  };

  if (data === null) {
    return (
      <div className="group flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
        <PiUserCircleDashed size={24} className="group-hover:animate-pulse" />

        <p>No client assigned to this project</p>

        <p className="flex items-center gap-1 text-xs">
          <PiArrowLeft />
          You can set a client over there
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-max flex-col gap-6 rounded-lg border p-5 shadow-lg shadow-black/50">
      <PiTriangleDuotone size={18} className="absolute -left-4 top-[30%] -rotate-90 text-border" />
      <Badge variant={"secondary"} className="w-max tracking-wide  text-muted-foreground">
        <PiUserDuotone size={15} />
        Client details
      </Badge>

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
                      placeholder={"Add an address (if applicable)"}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
