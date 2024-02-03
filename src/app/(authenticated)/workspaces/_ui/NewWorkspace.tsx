"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Output } from "valibot";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { createWorkspaceSchema } from "~/server/db/schema";
import { api } from "~/trpc/react";

export const CreateWorkspace = () => {
  const [open, setOpen] = useState(false);

  const form = useForm<Output<typeof createWorkspaceSchema>>({
    resolver: valibotResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { mutate } = api.workspaces.new.useMutation({
    onError: (err) => toast.error(err.message),
    onSuccess: () => toast.success("Workspace created"),
  });

  const onSubmit = form.handleSubmit((values) => {
    try {
      mutate(values);
      form.reset();
      setOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          <span>New workspace</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>New Workspace</DialogTitle>
        <DialogDescription>Somewhere to host your company</DialogDescription>

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

            <Button className="w-max">Create</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
