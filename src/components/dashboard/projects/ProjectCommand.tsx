"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { useCommandsStore } from "~/lib/stores/commands-store";
import { type ProjectSchema } from "~/server/db/edge-schema";
import { ClientsCombobox } from "../clients/ClientsCombobox";

export const ProjectCommand = () => {
  const opened = useCommandsStore((s) => s.opened) === "new-project";
  const setOpened = useCommandsStore((s) => s.setCommand);

  const onOpenChange = (opened: boolean) => {
    setOpened(opened ? "new-project" : null);
  };

  const form = useForm<ProjectSchema>();

  return (
    <Dialog open={opened} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Here you can create a new project, assign members, and set details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="mt-5 flex h-full flex-col gap-5">
            <ClientsCombobox />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Useful notes about the project, like its purpose and goals.
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormDescription>
                      The identifier is used to generate a unique URL for your project.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
