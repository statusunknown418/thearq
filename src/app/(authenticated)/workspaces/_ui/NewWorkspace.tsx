"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { PlusIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Output } from "valibot";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const form = useForm<Output<typeof createWorkspaceSchema>>({
    resolver: valibotResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const utils = api.useUtils();
  const { mutateAsync } = api.workspaces.new.useMutation({
    onMutate: () => toast.loading("Creating..."),
    onError: (err) => toast.error(err.message),
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
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-max justify-self-end">
          <PlusIcon />
          <span>New workspace</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>New Workspace</DialogTitle>
        <DialogDescription>
          Somewhere to host your company and for everyone to track time, projects, tasks, and more
        </DialogDescription>

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
      </DialogContent>
    </Dialog>
  );
};
