"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PiCalendarBlankDuotone, PiCalendarPlusDuotone, PiFloppyDisk } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import { KBD } from "~/components/ui/kbd";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { NOW } from "~/lib/dates";
import { useHotkeys } from "~/lib/hooks/use-hotkeys";
import { routes } from "~/lib/navigation";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { projectsSchema, type ProjectSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { ClientsCombobox } from "../clients/ClientsCombobox";
import { SingleDatePicker } from "../ui/single-date-picker";

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

      void Promise.all([
        utils.projects.getAll.invalidate(),
        utils.viewer.getAssignedProjects.invalidate(),
      ]);
      void router.push(routes.projects({ slug: workspace.slug }));
    },
    onError: (err) => {
      toast.error("Unable to create project", {
        description: err.message ?? err.data?.code ?? err.shape?.message ?? "Unknown error",
      });
    },
  });

  const form = useForm<ProjectSchema>({
    resolver: zodResolver(projectsSchema),
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

  useHotkeys([
    [
      "mod + enter",
      (e) => {
        e.preventDefault();
        void onSubmit();
      },
    ],
  ]);

  return (
    <Dialog open={opened} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Here you can create a new project, assign members, and set details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="mt-2 flex h-full flex-col gap-5" onSubmit={onSubmit}>
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

            <ClientsCombobox triggerClassnames="max-w-52" />

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

                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" subSize={"iconBase"}>
                            <PiCalendarPlusDuotone size={16} />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="min-w-52">
                          <DropdownMenuItem onSelect={() => field.onChange(addDays(new Date(), 1))}>
                            <PiCalendarBlankDuotone size={15} />

                            <span>Tomorrow</span>

                            <span className="ml-auto text-muted-foreground">
                              {format(addDays(new Date(), 1), "do MMMM")}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={() => field.onChange(startOfWeek(addWeeks(new Date(), 7)))}
                          >
                            <PiCalendarBlankDuotone size={15} />
                            <span>Next week</span>
                            <span className="ml-auto text-muted-foreground">
                              {format(startOfWeek(addDays(new Date(), 7)), "do MMMM")}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={() => field.onChange(startOfMonth(addMonths(new Date(), 1)))}
                          >
                            <PiCalendarBlankDuotone size={15} />
                            <span>Next month</span>

                            <span className="ml-auto text-muted-foreground">
                              {format(startOfMonth(addMonths(new Date(), 1)), "do MMMM")}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={() =>
                              field.onChange(startOfMonth(addQuarters(new Date(), 1)))
                            }
                          >
                            <PiCalendarBlankDuotone size={15} />

                            <span>Next quarter</span>

                            <span className="ml-auto text-muted-foreground">
                              {format(startOfMonth(addQuarters(new Date(), 1)), "do MMMM")}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <SingleDatePicker
                        date={field.value ?? undefined}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={{ before: NOW }}
                        defaultMonth={NOW}
                      />
                    </div>

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
                      Ends at <span className="ml-auto text-muted-foreground">(Optional)</span>
                    </FormLabel>

                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" subSize={"iconBase"}>
                            <PiCalendarPlusDuotone size={16} />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="min-w-52">
                          <DropdownMenuItem
                            onSelect={() => field.onChange(addWeeks(new Date(), 2))}
                          >
                            <PiCalendarBlankDuotone size={15} />

                            <span>In 2 weeks</span>

                            <span className="ml-auto text-muted-foreground">
                              {format(addWeeks(new Date(), 2), "do MMMM")}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={() => field.onChange(startOfMonth(addMonths(new Date(), 1)))}
                          >
                            <PiCalendarBlankDuotone size={15} />
                            <span>In 1 month</span>
                            <span className="ml-auto text-muted-foreground">
                              {format(startOfMonth(addMonths(new Date(), 1)), "do MMMM")}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={() => field.onChange(startOfMonth(addMonths(new Date(), 3)))}
                          >
                            <PiCalendarBlankDuotone size={15} />
                            <span>In 3 months</span>

                            <span className="ml-auto text-muted-foreground">
                              {format(startOfMonth(addMonths(new Date(), 3)), "do MMMM")}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={() => field.onChange(startOfWeek(addQuarters(new Date(), 1)))}
                          >
                            <PiCalendarBlankDuotone size={15} />

                            <span>Next quarter</span>

                            <span className="ml-auto text-muted-foreground">
                              {format(startOfWeek(addQuarters(new Date(), 1)), "do MMMM")}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <SingleDatePicker
                        date={field.value ?? undefined}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={{ before: NOW }}
                        defaultMonth={NOW}
                      />
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="mt-2 w-max self-end" disabled={isLoading}>
                    <PiFloppyDisk size={16} />
                    Create
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  Save <KBD>⌘</KBD> + <KBD>Enter</KBD>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
