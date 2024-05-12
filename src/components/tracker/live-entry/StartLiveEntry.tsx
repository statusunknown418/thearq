"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import { PiPlayDuotone, PiStopDuotone, PiWarningCircleDuotone } from "react-icons/pi";
import { toast } from "sonner";
import { omit } from "valibot";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { KBD } from "~/components/ui/kbd";
import { Toggle } from "~/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useHotkeys } from "~/lib/hooks/use-hotkeys";
import { cn } from "~/lib/utils";
import { timeEntrySchema, type NewTimeEntry } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { ProjectsCombobox } from "../../projects/ProjectsCombobox";
import { RealtimeCounter } from "../date-view/RealtimeCounter";
import { computeDuration } from "~/lib/dates";

export const StartLiveEntry = ({
  initialData,
}: {
  initialData: RouterOutputs["entries"]["getLiveEntry"];
}) => {
  const { data } = api.entries.getLiveEntry.useQuery(undefined, {
    initialData,
    refetchOnWindowFocus: true,
  });

  const entryExists = !!data?.id;

  const utils = api.useUtils();

  const { mutate: start, isLoading: starting } = api.tracker.start.useMutation({
    onSuccess: async () => {
      toast.success("Timer started");
      await Promise.all([
        utils.entries.getByMonth.invalidate(),
        utils.entries.getLiveEntry.invalidate(),
        utils.entries.getSummary.invalidate(),
      ]);
    },
    onError: (err) => {
      toast.error("Oh, something happened", {
        description: err.message,
      });
    },
  });

  const { mutate: inlineEdit } = api.tracker.update.useMutation({
    onSettled: () => {
      void utils.entries.getLiveEntry.invalidate();
    },
    onSuccess: async () => {
      await utils.entries.getByMonth.invalidate();
      toast.success("Timer updated");
    },
    onError: (err) => {
      toast.error("Oh, something happened", {
        description: err.message,
      });
    },
  });

  const { mutate: stop, isLoading: stopping } = api.tracker.stop.useMutation({
    onSuccess: async () => {
      form.reset(
        { start: new Date(), projectId: null, description: "" },
        { keepDirtyValues: false, keepValues: false },
      );
      toast.success("Timer stopped");
      await Promise.all([
        utils.entries.getByMonth.invalidate(),
        utils.entries.getLiveEntry.invalidate(),
        utils.entries.getSummary.invalidate(),
      ]);
    },
    onError: (err) => {
      toast.error("Oh, something happened", {
        description: err.message,
      });
    },
  });

  const form = useForm<NewTimeEntry>({
    resolver: valibotResolver(omit(timeEntrySchema, ["end", "duration", "workspaceId"])),
    defaultValues: data
      ? { ...data }
      : {
          description: "",
          projectId: null,
          billable: true,
          start: new Date(),
        },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (entryExists) {
      stop({
        id: data?.id,
        end: new Date(),
        duration: computeDuration({
          start: data?.start,
          end: new Date(),
        }),
      });

      form.reset();
    } else {
      start({
        ...values,
        start: new Date(),
      });
    }
  });

  useHotkeys([
    [
      "s",
      async () => {
        await handleSubmit();
      },
    ],
  ]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className="ml-auto flex items-center gap-2 self-center rounded-2xl bg-muted p-2 shadow dark:border"
      >
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                className="rounded-full"
                subSize={"iconMd"}
                disabled={starting || stopping}
              >
                {data?.start ? <PiStopDuotone size={24} /> : <PiPlayDuotone size={20} />}
              </Button>
            </TooltipTrigger>

            <TooltipContent side="bottom" align="start">
              {data?.start ? "Stop timer" : "Start timer"} <KBD>S</KBD>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem className="flex-row gap-1">
              <FormControl>
                <Input
                  {...field}
                  onBlur={(e) => {
                    if (!entryExists) return;

                    inlineEdit({
                      ...data,
                      description: e.target.value,
                    });
                  }}
                />
              </FormControl>

              {form.formState.errors.description && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <PiWarningCircleDuotone size={20} className={cn("text-destructive")} />
                    </TooltipTrigger>

                    <TooltipContent side="bottom" className="text-destructive">
                      {form.formState.errors.description.message}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
                  className="aspect-square"
                  variant={"outline"}
                  type="button"
                  pressed={!!field.value}
                  onPressedChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  $
                </Toggle>
              </FormControl>
            </FormItem>
          )}
        />

        <ProjectsCombobox
          size="lg"
          onSelect={() => {
            if (!entryExists) return;

            inlineEdit({
              ...data,
              projectId: form.getValues("projectId"),
            });
          }}
        />

        {data?.start ? (
          <RealtimeCounter
            start={data.start}
            className="h-9 rounded-lg border bg-secondary px-3 font-semibold"
          />
        ) : (
          <p className="flex h-9 items-center rounded-lg border bg-secondary px-3 text-muted-foreground">
            00:00:00
          </p>
        )}
      </form>
    </Form>
  );
};
