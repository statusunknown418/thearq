"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import Link from "next/link";
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
import { useAuthStore } from "~/lib/stores/auth-store";
import { useProjectPersonSheetStore } from "~/lib/stores/sheets-store";
import { projectUserSchema, type ProjectUserSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { useProjectsQS } from "../project-cache";
import { PersonCharts } from "./PersonCharts";

export const ProjectPersonSheet = () => {
  const auth = useAuthStore((s) => s.user);
  const open = useProjectPersonSheetStore((s) => s.open);
  const change = useProjectPersonSheetStore((s) => s.openChange);
  const details = useProjectPersonSheetStore((s) => s.data);
  const utils = api.useUtils();
  const [_state, setState] = useProjectsQS();

  const update = api.projects.updateMember.useMutation({
    onSuccess: async () => {
      await utils.projects.getTeam.invalidate();
    },
  });

  const form = useForm<ProjectUserSchema>({
    defaultValues: details ?? {},
    resolver: valibotResolver(projectUserSchema),
  });

  const onSubmit = form.handleSubmit((input) => {
    if (!details?.userId) return toast.error("User not found");

    toast.promise(
      update.mutateAsync({
        billableRate: sendAmount(input.billableRate ?? 0),
        internalCost: sendAmount(input.internalCost ?? 0),
        role: input.role ?? "member",
        userId: details?.userId,
        projectId: details?.projectId,
        weekCapacity: input.weekCapacity === Infinity ? null : Number(input.weekCapacity),
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
        if (!sw) {
          form.reset();
          void setState({ user: null });
        }
        change(sw);
      }}
    >
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{details?.user.name} details</SheetTitle>
          <SheetDescription asChild>
            <div>
              <p>
                Customize the different settings for this user, such as their billable rate, cost,
                and role; keep in mind that this is a{" "}
                <span className="text-emerald-500 dark:text-emerald-400">project-specific</span>{" "}
                setting.
              </p>

              <p className="mt-2">
                To globally change this user default settings, go to the{" "}
                <Button variant="link" className="h-max p-0" asChild>
                  <Link href={"../team"}>team page</Link>
                </Button>
                .
              </p>
            </div>
          </SheetDescription>
        </SheetHeader>

        <section className="mt-8 grid grid-cols-1 gap-4">
          <PersonCharts />

          <Form {...form}>
            <form className="flex h-full flex-col gap-5" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      disabled={details?.userId === auth?.id}
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

                    {details?.userId === auth?.id && (
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
                    <FormLabel>Billable rate (Default)</FormLabel>

                    <div className="flex items-center">
                      <span className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l">
                        <PiCurrencyDollarBold size={16} />
                      </span>
                      <FormControl>
                        <Input {...field} variant="number" className="min-w-40 rounded-l-none" />
                      </FormControl>
                    </div>

                    <FormDescription>
                      This is the default billable rate for this person. It will be used for all{" "}
                      <span className="font-semibold underline underline-offset-2">new</span>{" "}
                      projects created (can be customized per project).
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
                    <FormLabel>Internal cost (Default)</FormLabel>

                    <div className="flex items-center">
                      <span className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l">
                        <PiCurrencyDollarBold size={16} />
                      </span>
                      <FormControl>
                        <Input {...field} variant="number" className="min-w-40 rounded-l-none" />
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
                name="weekCapacity"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Week capacity</FormLabel>
                      <Switch
                        defaultChecked={!!details?.weekCapacity}
                        onCheckedChange={(e) => field.onChange(e ? 40 : Infinity)}
                      />
                    </div>

                    <div className="flex items-center">
                      <FormControl>
                        <Input
                          {...field}
                          variant="number"
                          className="min-w-40 rounded-r-none"
                          value={field.value === null ? Infinity : field.value}
                          disabled={field.value === Infinity || field.value === null}
                        />
                      </FormControl>

                      <span className="flex h-9 min-w-max items-center justify-center rounded-r-md border-y border-r px-2 text-xs font-medium">
                        hours
                      </span>
                    </div>

                    <FormDescription>
                      You can limit the number of hours this person can work in a week. If left
                      blank it will be considered as unlimited hours.
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
        </section>
      </SheetContent>
    </Sheet>
  );
};
