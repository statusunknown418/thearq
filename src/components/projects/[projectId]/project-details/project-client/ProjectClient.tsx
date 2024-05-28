"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PiArrowLeft, PiTriangleDuotone, PiUserCircleDashed, PiUserDuotone } from "react-icons/pi";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
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

  const utils = api.useUtils();

  const { mutate, isLoading } = api.clients.update.useMutation({
    onSuccess: () => {
      void utils.clients.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update client", {
        description: error.message,
      });
    },
  });

  const form = useForm<ClientSchema>({
    defaultValues: {
      name: data?.name,
      email: data?.email,
      address: data?.address,
      id: data?.id,
    },
  });

  useEffect(() => {
    if (isLoading) return;

    form.reset({
      name: data?.name,
      email: data?.email,
      address: data?.address,
      id: data?.id,
    });
  }, [data?.address, data?.email, data?.id, data?.name, form, isLoading]);

  const onSubmit = form.handleSubmit((data) => {
    mutate({
      ...data,
      id: data.id,
    });
  });

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

      <div className="flex items-center justify-between">
        <Badge variant={"secondary"} className="w-max tracking-wide  text-muted-foreground">
          <PiUserDuotone size={15} />
          Client details
        </Badge>

        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader />
            <span>Saving...</span>
          </div>
        )}
      </div>

      <Form {...form}>
        <form className="flex w-full flex-col gap-4 rounded-lg" onSubmit={onSubmit}>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="grid w-full grid-cols-5 gap-2">
                <FormLabel>Name</FormLabel>

                <div className="col-span-4 flex flex-col gap-2">
                  <Input {...field} value={field.value ?? ""} placeholder="Client name" />
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
                      placeholder={"Add an address (if applicable)"}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-max self-end">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};
