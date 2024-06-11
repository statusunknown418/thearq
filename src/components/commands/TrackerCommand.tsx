import { valibotResolver } from "@hookform/resolvers/valibot";
import { addHours } from "date-fns";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  PiArrowRight,
  PiCurrencyDollarBold,
  PiDotsThreeVertical,
  PiFloppyDisk,
  PiPaperPlaneTilt,
  PiTrashDuotone,
} from "react-icons/pi";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { KBD } from "~/components/ui/kbd";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { Toggle } from "~/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { computeDuration, dateToMonthDate } from "~/lib/dates";
import { useHotkeys } from "~/lib/hooks/use-hotkeys";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { createFakeEvent, useEventsStore } from "~/lib/stores/events-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { type CustomEvent } from "~/server/api/routers/entries";
import { timeEntrySchema, type NewTimeEntry } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { ProjectsCombobox } from "../projects/ProjectsCombobox";
import { FromIntegrationDialog } from "../tracker/FromIntegrationDialog";

const DynamicDateTimeInput = dynamic(
  () => import("~/components/ui/date-time-input").then((mod) => mod.DateTimeInput),
  {
    ssr: false,
    loading: () => <div className="h-8 w-24 rounded-md border bg-secondary" />,
  },
);

const baseDefaultValues = {
  description: "",
  billable: true,
  duration: 0,
  projectId: null,
  temp: true,
  integrationUrl: "",
  monthDate: dateToMonthDate(new Date()),
  trackedAt: new Date(),
  weekNumber: null,
};

export const TrackerCommand = ({ defaultValues }: { defaultValues?: CustomEvent }) => {
  const router = useRouter();

  const open = useCommandsStore((s) => s.opened) === "auto-tracker";
  const setOpen = useCommandsStore((s) => s.setCommand);
  const clear = useCommandsStore((s) => s.clear);
  const clearEvents = useEventsStore((s) => s.clear);
  const workspaceId = useWorkspaceStore((s) => s.active?.id);

  const { data: auth } = useSession({
    required: true,
    onUnauthenticated: () => {
      void router.replace("/api/auth/signin");
    },
  });

  const isEditing = !!defaultValues;

  const onCancelTrack = (state: boolean) => {
    if (!state) {
      clear();
      clearEvents();
      form.reset({});
      setOpen(null);
    }
  };

  const form = useForm<NewTimeEntry>({
    resolver: valibotResolver(timeEntrySchema),
    defaultValues: !!defaultValues
      ? defaultValues
      : {
          ...baseDefaultValues,
          start: new Date(),
          end: addHours(new Date(), 1),
          duration: 3600,
        },
  });

  const utils = api.useUtils();

  const { mutate: deleteEntry } = api.tracker.remove.useMutation({
    onMutate: async (entry) => {
      const monthDate = dateToMonthDate(new Date());

      if (!workspaceId) return;

      const prev = utils.entries.getByMonth.getData({ monthDate });

      if (!prev || !auth?.user || !workspaceId) return;

      clearEvents();
      return utils.entries.getByMonth.setData({ monthDate }, (oldData) => {
        if (!oldData) return [];

        return prev.filter((e) => e.id !== entry.id);
      });
    },
    onSettled: async () => {
      clearEvents();
      clear();
      return await Promise.all([
        utils.entries.getByMonth.invalidate(),
        utils.entries.getSummary.invalidate(),
        utils.viewer.getAnalyticsCharts.invalidate(),
        utils.viewer.getAnalyticsMetrics.invalidate(),
        utils.projects.getHoursCharts.invalidate(),
        utils.projects.getRevenueCharts.invalidate(),
      ]);
    },
    onSuccess: () => {
      toast.warning("Deleted entry");
    },
  });

  const { mutate: updateEntry } = api.tracker.update.useMutation({
    onSettled: async () => {
      return await Promise.all([
        utils.entries.getByMonth.invalidate(),
        utils.entries.getSummary.invalidate(),
        utils.viewer.getAnalyticsCharts.invalidate(),
        utils.viewer.getAnalyticsMetrics.invalidate(),
        utils.projects.getHoursCharts.invalidate(),
        utils.projects.getRevenueCharts.invalidate(),
      ]);
    },
    onSuccess: async () => {
      clearEvents();
      toast.success("Updated entry");
    },
    onError: (error) => {
      toast.error("Failed to update entry", { description: error.message });
    },
  });

  const { mutate: manualTrack } = api.tracker.manual.useMutation({
    onMutate: async (input) => {
      const monthDate = dateToMonthDate(new Date());

      if (!workspaceId) return;

      const prev = utils.entries.getByMonth.getData({ monthDate });

      if (!prev || !auth?.user || !workspaceId) return;

      const computedEvent = createFakeEvent("temporal", {
        end: input.end ?? null,
        start: input.start,
        auth: auth.user,
        workspaceId,
      });

      clearEvents();
      return utils.entries.getByMonth.setData({ monthDate }, () => [
        ...prev,
        computedEvent as CustomEvent,
      ]);
    },
    onSettled: async () => {
      clearEvents();
      return await Promise.all([
        utils.entries.getByMonth.invalidate(),
        utils.entries.getSummary.invalidate(),
        utils.viewer.getAnalyticsCharts.invalidate(),
        utils.viewer.getAnalyticsMetrics.invalidate(),
        utils.projects.getHoursCharts.invalidate(),
        utils.projects.getRevenueCharts.invalidate(),
      ]);
    },
    onSuccess: () => {
      toast.success("Added new entry");
    },
    onError: (error) => {
      toast.error("Failed to add new entry", { description: error.message });
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (!data.end || !data.start) {
      return toast.error("Start and end time are required", {
        description: "This is unexpected please report this bug to us",
      });
    }

    const computedDuration = computeDuration({
      end: data.end,
      start: data.start,
    });

    if (isEditing && !defaultValues.temp) {
      updateEntry({
        ...data,
        id: defaultValues.id,
        duration: computedDuration,
      });
    } else {
      manualTrack({
        ...data,
        duration: computedDuration,
      });
    }

    clear();
    form.reset({});
  });

  useEffect(() => {
    if (workspaceId) {
      form.setValue("workspaceId", workspaceId);
    }
  }, [form, workspaceId]);

  useHotkeys(
    [
      ["Meta+Enter", () => onSubmit()],
      [
        "Shift+B",
        () => {
          form.setValue("billable", !form.getValues("billable"));
        },
      ],
    ],
    ["textarea", "input"],
  );

  return (
    <Dialog open={open} onOpenChange={onCancelTrack}>
      <Form {...form}>
        <DialogContent className="max-h-full max-w-2xl">
          <form className="grid grid-cols-1 gap-4" onSubmit={onSubmit}>
            <div className="flex items-center gap-2">
              <Badge className="w-max rounded-sm">{isEditing ? "Edit" : "Add new"}</Badge>

              <FromIntegrationDialog />
            </div>

            <div className="mt-2 flex flex-wrap justify-between gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Description </FormLabel>

                    <FormControl>
                      <Textarea
                        autoFocus
                        cacheMeasurements
                        minRows={2}
                        maxRows={10}
                        className="max-w-full resize-none rounded-none !border-none !bg-transparent p-0 text-sm shadow-none focus:!outline-none focus:!ring-0 focus-visible:!ring-0"
                        placeholder="Add a description..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <section className="mt-2 flex items-center gap-2">
              <div className="relative flex items-center gap-2">
                <ProjectsCombobox />

                <FormField
                  control={form.control}
                  name="billable"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <Toggle
                              asChild
                              variant={"outline"}
                              type="button"
                              pressed={!!field.value}
                              onPressedChange={field.onChange}
                              onBlur={field.onBlur}
                              className="h-8 w-8 p-0"
                            >
                              <TooltipTrigger>
                                <PiCurrencyDollarBold size={16} />
                              </TooltipTrigger>
                            </Toggle>

                            <TooltipContent>
                              Mark entry as billable <KBD>Shift</KBD> + <KBD>B</KBD>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Separator orientation="vertical" />

                <DynamicDateTimeInput selector="start" />

                <PiArrowRight size={15} />

                <DynamicDateTimeInput selector="end" />
              </div>

              {/* <p className="text-xs text-muted-foreground">took</p>

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TimePicker
                        value={new Date(new Date().setSeconds(field.value))}
                        onChange={(date) => {
                          const value = date ? new Date(date) : new Date();

                          field.onChange(
                            new Date(new Date().setSeconds(value.getSeconds())).getSeconds(),
                          );

                          return value;
                        }}
                      >
                        <TimePickerSegment segment={"hours"} />
                        <TimePickerSeparator>:</TimePickerSeparator>
                        <TimePickerSegment segment={"minutes"} />
                      </TimePicker>
                    </FormControl>
                  </FormItem>
                )}
              /> */}
            </section>

            <Separator className="-ml-6 mb-1 mt-4 w-[670px]" />

            <DialogFooter>
              {!defaultValues?.temp && !!defaultValues && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"outline"} size={"icon"} className="ml-auto">
                      <PiDotsThreeVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => {
                          if (!defaultValues?.id) return;

                          deleteEntry({ id: defaultValues?.id });
                          setOpen(null);
                        }}
                      >
                        <PiTrashDuotone size={16} className="text-destructive" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" type="button" onClick={() => setOpen(null)}>
                      Cancel
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side="bottom">
                    Close <KBD>ESC</KBD>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button>
                      {isEditing ? <PiFloppyDisk size={16} /> : <PiPaperPlaneTilt />}
                      {isEditing ? "Save" : "Add"}
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side="bottom">
                    Save <KBD>⌘</KBD> + <KBD>Enter</KBD>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
};
