"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PiFloppyDisk } from "react-icons/pi";
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
      change(false);
      return await utils.workspaces.getTeamByWorkspace.invalidate();
    },
  });
  const form = useForm<UsersOnWorkspacesSchema>({
    resolver: valibotResolver(usersOnWorkspacesSchema),
    defaultValues: {
      ...details,
    },
  });

  const onSubmit = form.handleSubmit((input) => {
    toast.promise(
      update.mutateAsync({
        ...input,
        defaultWeekCapacity:
          input.defaultWeekCapacity === Infinity ? null : input.defaultWeekCapacity,
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
            Edit this person&apos;s details, like their billable rate, role, and internal cost.
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
                      <SelectItem value="manager">Manager</SelectItem>
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

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormDescription>
                    This is the default billable rate for this person. It can be customized per
                    project.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="internalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal cost</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormDescription>
                    This is the person&apos;s cost to the company. It is used to calculate the
                    profitability of the projects.
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

                  <FormControl>
                    <Input
                      {...field}
                      value={field.value === null ? Infinity : field.value}
                      disabled={field.value === Infinity || field.value === null}
                    />
                  </FormControl>

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
