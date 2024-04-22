"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { CalendarIcon } from "@radix-ui/react-icons";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PiFloppyDisk } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { routes } from "~/lib/navigation";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { projectsSchema, type ProjectSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { ClientsCombobox } from "../clients/ClientsCombobox";

export const ProjectCommand = () => {
  const router = useRouter();

  const workspace = useWorkspaceStore((s) => s.active);
  const opened = useCommandsStore((s) => s.opened) === "new-project";
  const setOpened = useCommandsStore((s) => s.setCommand);

  const onOpenChange = (opened: boolean) => {
    setOpened(opened ? "new-project" : null);
  };

  const utils = api.useUtils();

  const { mutate, isLoading } = api.projects.create.useMutation({
    onSuccess: () => {
      if (!workspace?.slug)
        return toast.error("No workspace selected", {
          description: "Try selecting one or reload the page",
        });

      setOpened(null);
      form.reset();
      toast.success("Project created");
      void utils.projects.get.invalidate();
      void router.push(routes.projects({ slug: workspace.slug }));
    },
    onError: (err) => {
      toast.error("Unable to create project", {
        description: err.message ?? err.data?.code ?? err.shape?.message ?? "Unknown error",
      });
    },
  });

  const form = useForm<ProjectSchema>({
    resolver: valibotResolver(projectsSchema),
    defaultValues: {
      name: "",
      description: "",
      identifier: "",
      color: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  return (
    <Dialog open={opened} onOpenChange={onOpenChange}>
      <DialogContent className="top-[45%]">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Here you can create a new project, assign members, and set details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="mt-2 flex h-full flex-col gap-5" onSubmit={onSubmit}>
            <ClientsCombobox />

            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SaaS App" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem className="w-20">
                    <FormLabel>Identifier</FormLabel>

                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="TRX" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} maxRows={8} />
                  </FormControl>
                  <FormDescription>
                    Internal notes about the project, like its purpose and goals.
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name={"startsAt"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Starts at <span className="text-muted-foreground">(Optional)</span>
                    </FormLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={field.value ? "primary" : "secondary"} size={"lg"}>
                          <CalendarIcon className={cn("h-4 w-4")} />
                          {field.value ? formatDate(field.value, "PPP") : "Select a start date"}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="flex min-w-max items-center justify-center p-0">
                        <Calendar
                          className="w-full"
                          mode="single"
                          onSelect={field.onChange}
                          onDayBlur={field.onBlur}
                          disabled={{ before: new Date() }}
                          selected={field.value ?? undefined}
                          defaultMonth={field.value ?? undefined}
                        />
                      </PopoverContent>
                    </Popover>

                    <FormDescription />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={"endsAt"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ends at <span className="text-muted-foreground">(Optional)</span>
                    </FormLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={field.value ? "primary" : "secondary"} size={"lg"}>
                          <CalendarIcon className={cn("h-4 w-4")} />
                          {field.value ? formatDate(field.value, "PPP") : "Select an end date"}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="flex min-w-max items-center justify-center p-0">
                        <Calendar
                          className="w-full"
                          mode="single"
                          onSelect={field.onChange}
                          onDayBlur={field.onBlur}
                          selected={field.value ?? undefined}
                          defaultMonth={field.value ?? undefined}
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button className="mt-2" disabled={isLoading}>
              <PiFloppyDisk size={16} />
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
