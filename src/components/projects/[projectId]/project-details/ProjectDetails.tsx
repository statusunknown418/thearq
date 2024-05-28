"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import { PiSquaresFourDuotone, PiXCircle } from "react-icons/pi";
import { toast } from "sonner";
import { ClientsCombobox } from "~/components/clients/ClientsCombobox";
import { Badge } from "~/components/ui/badge";
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
import { Label } from "~/components/ui/label";
import { Loader } from "~/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SingleDatePicker } from "~/components/ui/single-date-picker";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useFormAutoSave } from "~/lib/hooks/use-form-auto-save";
import { useSafeParams } from "~/lib/navigation";
import {
  lockingSchedules,
  projectTypes,
  projectsSchema,
  type ProjectSchema,
} from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const ProjectDetails = ({
  initialData,
}: {
  initialData: RouterOutputs["projects"]["getDetails"];
}) => {
  const params = useSafeParams("projectId");

  const utils = api.useUtils();

  const { mutate, isLoading } = api.projects.edit.useMutation({
    onError: (error) => {
      toast.error("Failed to update project", {
        description: error.message,
      });
    },
    onSuccess: () => {
      void utils.projects.invalidate();
      void utils.viewer.getAssignedProjects.invalidate();
      void utils.clients.getByProject.invalidate();
    },
  });

  const { data } = api.projects.getDetails.useQuery(
    {
      shareableUrl: params.id,
    },
    {
      initialData,
    },
  );

  const form = useForm<ProjectSchema>({
    resolver: valibotResolver(projectsSchema),
    defaultValues: data,
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((values) => {
    mutate({
      ...values,
      budgetHours: values.budgetHours ? Number(values.budgetHours) : null,
    });
  });

  useFormAutoSave({
    form,
    onSubmit: () => void onSubmit(),
  });

  return (
    <Form {...form}>
      <form
        className="flex h-max w-full flex-col gap-5 rounded-lg border bg-secondary-background p-5"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between">
          <Badge variant={"secondary"} className="w-max tracking-wide text-muted-foreground">
            <PiSquaresFourDuotone size={16} />
            Project details
          </Badge>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader />
              <span>Saving ...</span>
            </div>
          )}
        </div>

        <FormField
          name="clientId"
          control={form.control}
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5 gap-4">
              <FormLabel>Client</FormLabel>

              <div className="col-span-4 flex items-center gap-2">
                <ClientsCombobox
                  triggerClassnames="w-52"
                  showLabel={false}
                  onSelect={() => onSubmit()}
                />

                {!!field.value && (
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={() => {
                      form.setValue("clientId", null);
                      void onSubmit();
                    }}
                  >
                    <PiXCircle size={16} className="text-muted-foreground" />
                  </Button>
                )}
              </div>
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5 gap-4">
              <FormLabel>Description</FormLabel>

              <div className="col-span-4 flex flex-col gap-2">
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={"Add a description"}
                    value={field.value ?? ""}
                  />
                </FormControl>

                <FormDescription>Internal notes, not shared with the client</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          name="identifier"
          control={form.control}
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5 gap-4">
              <FormLabel>Identifier</FormLabel>

              <div className="col-span-4 flex flex-col gap-2">
                <FormControl>
                  <Input
                    {...field}
                    placeholder={"AQX-777"}
                    value={field.value ?? ""}
                    className="max-w-24"
                  />
                </FormControl>

                <FormDescription>Internal notes, not shared with the client</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          name="budgetHours"
          control={form.control}
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5 gap-4">
              <FormLabel>Budget hours</FormLabel>

              <section className="col-span-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={"200"}
                      className="max-w-24"
                      value={field.value ?? ""}
                    />
                  </FormControl>

                  <span className="text-muted-foreground">hours</span>
                </div>

                {form.formState.errors.budgetHours ? (
                  <FormMessage />
                ) : (
                  <FormDescription>
                    Amount of hours expected to complete the project (optional)
                  </FormDescription>
                )}
              </section>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetResetsPerMonth"
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5 gap-4">
              <FormLabel>Resettable</FormLabel>

              <section className="col-span-4 flex flex-col gap-2">
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={(v) => {
                      field.onChange(v);
                      void onSubmit();
                    }}
                    size="md"
                  />
                </FormControl>

                <FormDescription>
                  If the budget hours should reset on a monthly basis
                </FormDescription>
              </section>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5 gap-4">
              <FormLabel className="inline-flex items-center gap-2 self-start">
                Project billing
              </FormLabel>

              <section className="col-span-4 flex flex-col gap-2">
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    void onSubmit();
                  }}
                >
                  <SelectTrigger className="max-w-52 capitalize">
                    <FormControl>
                      <SelectValue placeholder="Hourly" />
                    </FormControl>
                  </SelectTrigger>

                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.replaceAll("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormDescription>Choose the type of billing for this project</FormDescription>
              </section>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entriesLockingSchedule"
          render={({ field }) => (
            <FormItem className="grid w-full grid-cols-5  gap-4">
              <Label className="inline-flex items-center gap-2 self-start">Entry locking</Label>

              <section className="col-span-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(v) => {
                      field.onChange(v);

                      void onSubmit();
                    }}
                  >
                    <SelectTrigger className="max-w-52 capitalize">
                      <FormControl>
                        <SelectValue placeholder="" />
                      </FormControl>
                    </SelectTrigger>

                    <SelectContent>
                      {lockingSchedules.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type.replaceAll("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!!field.value && (
                    <Button
                      variant={"outline"}
                      size={"icon"}
                      onClick={() => {
                        form.setValue("entriesLockingSchedule", null);
                        void onSubmit();
                      }}
                    >
                      <PiXCircle size={16} className="text-muted-foreground" />
                    </Button>
                  )}
                </div>

                <FormDescription>
                  Choose if the entries should be locked after a certain time
                </FormDescription>
              </section>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-5 items-center justify-between gap-4">
          <FormField
            name="startsAt"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-3 grid grid-cols-6 flex-row">
                <FormLabel className="col-span-2">Time frame</FormLabel>

                <div className="col-span-4 w-full">
                  <SingleDatePicker
                    buttonClassName="min-w-full"
                    date={field.value ?? undefined}
                    onChange={field.onChange}
                    placeholder="Start date"
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="endsAt"
            control={form.control}
            render={({ field }) => (
              <div className="col-span-2 w-full">
                <SingleDatePicker
                  buttonClassName="min-w-full"
                  date={field.value ?? undefined}
                  defaultMonth={field.value ?? undefined}
                  onChange={field.onChange}
                  placeholder="End date"
                />
              </div>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
