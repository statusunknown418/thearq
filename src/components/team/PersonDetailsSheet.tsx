"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PiCurrencyDollarBold, PiFloppyDisk } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import { sendAmount } from "~/lib/parsers";
import { useDetailsSheetStore } from "~/lib/stores/sheets-store";
import { usersOnWorkspacesSchema, type UsersOnWorkspacesSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";

export const PersonDetailsSheet = () => {
  const open = useDetailsSheetStore((s) => s.open);
  const change = useDetailsSheetStore((s) => s.openChange);
  const details = useDetailsSheetStore((s) => s.details);
  const utils = api.useUtils();

  const update = api.workspaces.updateMemberDetails.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.teams.getByWorkspace.invalidate(),
        utils.viewer.getAnalyticsCharts.invalidate(),
        utils.viewer.getAnalyticsMetrics.invalidate(),
        utils.projects.getHoursCharts.invalidate(),
        utils.projects.getRevenueCharts.invalidate(),
      ]);
    },
  });

  const form = useForm<UsersOnWorkspacesSchema>({
    resolver: valibotResolver(usersOnWorkspacesSchema),
    defaultValues: details ?? {},
  });

  const onSubmit = form.handleSubmit((input) => {
    toast.promise(
      update.mutateAsync({
        ...input,
        defaultWeekCapacity:
          input.defaultWeekCapacity === Infinity ? null : input.defaultWeekCapacity,
        defaultBillableRate: sendAmount(input.defaultBillableRate ?? 0),
        defaultInternalCost: sendAmount(input.defaultInternalCost ?? 0),
      }),
      {
        loading: "Saving...",
        success: "Saved!",
        error: "Failed to save",
      },
    );
  });

  useEffect(() => {
    if (!!details) form.reset(details);
  }, [details, form]);

  return (
    <Sheet
      open={open}
      onOpenChange={(sw) => {
        if (!sw) form.reset();
        change(sw);
      }}
    >
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{details?.user.name}&apos;s profile</SheetTitle>

          <SheetDescription>
            Edit this person&apos;s global details, like their billable rate, role, and internal
            cost.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form className="mt-5 flex h-full flex-col gap-5" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    disabled={!!details?.owner}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      {/* <SelectItem value="manager">Manager</SelectItem> */}
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>

                  {details?.owner && (
                    <FormDescription>You cannot change the owner&apos;s role.</FormDescription>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultBillableRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billable rate (Default)</FormLabel>

                  <div className="flex items-center">
                    <span className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l">
                      <PiCurrencyDollarBold size={16} />
                    </span>
                    <FormControl>
                      <Input {...field} variant="number" className="rounded-l-none" />
                    </FormControl>
                  </div>

                  <FormDescription>
                    This is the default billable rate for this person. It will be used for all{" "}
                    <span className="font-semibold underline underline-offset-2">new</span> projects
                    created (can be customized per project).
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultInternalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal cost (Default)</FormLabel>

                  <div className="flex items-center">
                    <span className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l">
                      <PiCurrencyDollarBold size={16} />
                    </span>
                    <FormControl>
                      <Input {...field} variant="number" className="rounded-l-none" />
                    </FormControl>
                  </div>

                  <FormDescription>
                    This is the person&apos;s cost to the company. It will be used for all{" "}
                    <span className="italic">new</span> projects created (can be customized per
                    project).
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultWeekCapacity"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Week capacity</FormLabel>
                    <Switch
                      defaultChecked={!!details?.defaultWeekCapacity}
                      onCheckedChange={(e) => field.onChange(e ? 40 : Infinity)}
                    />
                  </div>

                  <div className="flex items-center">
                    <FormControl>
                      <Input
                        {...field}
                        variant="number"
                        className="rounded-r-none"
                        value={field.value === null ? Infinity : field.value}
                        disabled={field.value === Infinity || field.value === null}
                      />
                    </FormControl>

                    <span className="flex h-9 min-w-max items-center justify-center rounded-r-md border-y border-r px-2 text-xs font-medium">
                      hours
                    </span>
                  </div>

                  <FormDescription>
                    You can limit the number of hours this person can work in a week. If left blank
                    it will be considered as unlimited hours.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="self-end">
              <Button className="max-w-max">
                <PiFloppyDisk size={16} />
                Save
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
