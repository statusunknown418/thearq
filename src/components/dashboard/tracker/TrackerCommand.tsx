import { valibotResolver } from "@hookform/resolvers/valibot";
import { addHours, format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  PiArrowRight,
  PiDotsThreeVertical,
  PiFloppyDisk,
  PiLink,
  PiPaperPlaneRightDuotone,
  PiSquaresFourDuotone,
  PiTrashDuotone,
} from "react-icons/pi";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DateTimeInput } from "~/components/ui/date-time-input";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { KBD } from "~/components/ui/kbd";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import {
  TimePicker,
  TimePickerSegment,
  TimePickerSeparator,
} from "~/components/ui/time-picker/time-field";
import { Toggle } from "~/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { createFakeEvent, useEventsStore } from "~/lib/stores/events-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { useHotkeys } from "~/lib/use-hotkeys";
import { type CustomEvent } from "~/server/api/routers/entries";
import { timeEntrySchema, type NewTimeEntry } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";

const baseDefaultValues = {
  description: "",
  billable: true,
  duration: 0,
  projectId: null,
  integrationUrl: "",
  monthDate: format(new Date(), "yyyy/MM"),
  trackedAt: format(new Date(), "yyyy/MM/dd"),
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
      setOpen(null);
      clear();
      clearEvents();
      form.reset({});
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
        },
  });

  const utils = api.useUtils();

  const { mutate: deleteEntry } = api.tracker.delete.useMutation({
    onMutate: async (entry) => {
      const monthDate = format(new Date(), "yyyy/MM");

      if (!workspaceId) return;

      const prev = utils.entries.getByMonth.getData({ workspaceId, monthDate });

      if (!prev || !auth?.user || !workspaceId) return;

      clearEvents();

      return utils.entries.getByMonth.setData({ workspaceId, monthDate }, (oldData) => {
        if (!oldData) return [];

        return oldData.filter((e) => e.id !== entry.id);
      });
    },
  });

  const { mutate: updateEntry } = api.tracker.update.useMutation({
    onSettled: async () => {
      clearEvents();
      return await utils.entries.getByMonth.invalidate();
    },
    onSuccess: async () => {
      toast.success("Updated entry");
      await Promise.all([
        utils.entries.getSummary.invalidate(),
        utils.entries.getLiveEntry.invalidate(),
      ]);
    },
    onError: (error) => {
      toast.error("Failed to update entry", { description: error.message });
    },
  });

  const { mutate: manualTrack } = api.tracker.manual.useMutation({
    onMutate: async (input) => {
      const monthDate = format(new Date(), "yyyy/MM");

      if (!workspaceId) return;

      const prev = utils.entries.getByMonth.getData({ workspaceId, monthDate });

      if (!prev || !auth?.user || !workspaceId) return;

      const computedEvent = createFakeEvent("temporal", {
        end: input.end ?? null,
        start: input.start,
        auth: auth.user,
        workspaceId,
      });

      clearEvents();

      return utils.entries.getByMonth.setData({ workspaceId, monthDate }, () => [
        ...prev,
        computedEvent as CustomEvent,
      ]);
    },
    onSettled: async () => {
      return await utils.entries.getByMonth.invalidate();
    },
    onSuccess: () => {
      toast.success("Added new entry");
      void utils.entries.getSummary.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to add new entry", { description: error.message });
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (isEditing && !defaultValues.temp) {
      updateEntry({
        ...data,
        id: defaultValues.id,
        duration: Number(data.duration),
      });
    } else {
      manualTrack({
        ...data,
        duration: Number(data.duration),
      });
    }

    clear();
    form.reset({});
  });

  useHotkeys([["Meta+Enter", () => onSubmit()]], ["textarea", "input"]);

  return (
    <Dialog open={open} onOpenChange={onCancelTrack}>
      <DialogContent className="top-[40%] max-w-2xl">
        <Form {...form}>
          <form className="grid grid-cols-1 gap-4" onSubmit={onSubmit}>
            <div className="flex items-center gap-2">
              <Badge className="w-max">Manual</Badge>

              {/* <PiShuffle size={16} className="text-muted-foreground" /> */}
              <p className="text-muted-foreground">or</p>

              <Button
                variant={"secondary"}
                className="w-max rounded-full"
                size={"sm"}
                type="button"
              >
                <PiLink size={16} />
                From integration
              </Button>
            </div>

            <div className="mt-2 flex flex-wrap justify-between gap-4">
              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Description </FormLabel>

                    <FormControl>
                      <Textarea
                        autoFocus
                        className="max-w-full resize-none rounded-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                        placeholder="Added new features ..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <section className="mt-2 flex items-center gap-2">
              <div className="relative flex items-center gap-2">
                <DateTimeInput selector="start" />
                <PiArrowRight size={15} />
                <DateTimeInput selector="end" />
              </div>

              <p className="text-xs text-muted-foreground">took</p>

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
              />
            </section>

            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"secondary"}>
                          <PiSquaresFourDuotone size={16} />
                          Project
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="start">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Available projects</DropdownMenuLabel>

                          <DropdownMenuItem>the arq</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billable"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Toggle
                        size={"sm"}
                        variant={"outline"}
                        type="button"
                        pressed={!!field.value}
                        onPressedChange={field.onChange}
                        onBlur={field.onBlur}
                      >
                        $ Billable
                      </Toggle>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="-ml-6 mb-1 mt-4 w-[670px]" />

            <DialogFooter>
              {!defaultValues?.temp && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"outline"} size={"icon"} className="ml-auto">
                      <PiDotsThreeVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          if (!defaultValues?.id) return;

                          deleteEntry({ id: defaultValues?.id });
                          setOpen(null);
                        }}
                      >
                        <PiTrashDuotone size={16} />
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
                      {isEditing ? (
                        <PiFloppyDisk size={16} />
                      ) : (
                        <PiPaperPlaneRightDuotone size={16} />
                      )}
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};
