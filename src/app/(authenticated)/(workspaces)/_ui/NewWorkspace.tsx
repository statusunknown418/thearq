"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { ArrowDownIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";
import { type Output } from "valibot";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { routes } from "~/lib/navigation";
import { createWorkspaceSchema } from "~/server/db/schema";
import { api } from "~/trpc/react";

export const NewWorkspace = () => {
  const router = useRouter();
  const form = useForm<Output<typeof createWorkspaceSchema>>({
    resolver: valibotResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
    },
  });

  const utils = api.useUtils();
  const { mutateAsync } = api.workspaces.new.useMutation({
    onError: (err) => {
      if (err.data?.code === "CONFLICT") form.setError("slug", { message: err.message });
    },
    onSuccess: async (data) => {
      await utils.workspaces.get.refetch();
      toast.success("Workspace created");
      router.push(routes.dashboard({ slug: data.slug }));
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      form.reset();
    } catch (err) {
      err instanceof Error && toast.error(err.message);
    }
  });

  const name = form.watch("name");

  useEffect(() => {
    form.setValue("slug", slugify(name, { lower: true }));
  }, [form, name]);

  return (
    <section className="grid grid-cols-1 gap-6 rounded-3xl border bg-muted p-7 shadow-2xl shadow-black">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">New Workspace</h2>
        <p className="text-muted-foreground">
          Somewhere to host your company and for everyone to track time, projects, tasks, and more
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Workspace name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex w-full flex-col items-center text-muted-foreground">
            <ArrowDownIcon className="h-4 w-4" />
          </div>

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <Input
                    disabled
                    readOnly
                    defaultValue={"name.com/workspaces/"}
                    className="w-fit rounded-r-none border-r-0"
                  />

                  <FormControl>
                    <Input {...field} placeholder="my-company" className="z-10 rounded-l-none" />
                  </FormControl>
                </div>

                <FormDescription>
                  This is the URL that your team will use to access this workspace
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader />}
              Let&apos;s do it!
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </section>
  );
};