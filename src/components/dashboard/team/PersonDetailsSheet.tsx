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
import { useDetailsSheetStore } from "~/lib/stores/sheets-store";
import { usersOnWorkspacesSchema, type UsersOnWorkspacesSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";

export const PersonDetailsSheet = ({ slug }: { slug: string }) => {
  const open = useDetailsSheetStore((s) => s.open);
  const change = useDetailsSheetStore((s) => s.openChange);
  const details = useDetailsSheetStore((s) => s.details);

  const update = api.workspaces.updateMemberDetails.useMutation();
  const form = useForm<UsersOnWorkspacesSchema>({
    resolver: valibotResolver(usersOnWorkspacesSchema),
    defaultValues: {
      ...details,
    },
  });

  const onSubmit = form.handleSubmit((input) => {
    toast.promise(update.mutateAsync({ ...input, workspaceSlug: slug }), {
      loading: "Saving...",
      success: "Saved!",
      error: "Failed to save",
    });
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
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{details?.user.name}&apos;s profile</SheetTitle>

          <SheetDescription>
            Edit this person&apos;s details, like their billable rate, role, and internal cost.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
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
              name="billableRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billable rate</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

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

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Week capacity</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="max-w-max">
              <PiFloppyDisk size={16} />
              Save
            </Button>
          </form>

          <SheetDescription className="mt-6">
            These details are viewable to each member by default but you can change it so that only
            admins can view them.
          </SheetDescription>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
