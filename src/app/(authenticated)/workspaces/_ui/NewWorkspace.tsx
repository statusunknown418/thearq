"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
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
    onMutate: () => toast.loading("Creating..."),
    onError: (err) => {
      if (err.data?.code === "CONFLICT") form.setError("slug", { message: err.message });
    },
    onSuccess: async (data) => {
      await utils.workspaces.get.invalidate();
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

  return (
    <section className="bg-muted grid grid-cols-1 gap-2 rounded-3xl border p-7 shadow-2xl shadow-black">
      <h2 className="text-2xl font-bold">New Workspace</h2>
      <p className="text-muted-foreground">
        Somewhere to host your company and for everyone to track time, projects, tasks, and more
      </p>

      <Form {...form}>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ABC Studios" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shareable URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="my-company" />
                </FormControl>
                <FormDescription>
                  This is the URL that your team will use to access this workspace
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button disabled={form.formState.isSubmitting}>Create</Button>
          </DialogFooter>
        </form>
      </Form>
    </section>
  );
};
