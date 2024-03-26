import { CalendarIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { format, setDate, setDay, startOfMonth, subDays, subWeeks } from "date-fns";
import { useForm } from "react-hook-form";
import {
  PiArrowArcLeft,
  PiArrowCounterClockwise,
  PiLink,
  PiRewind,
  PiShuffle,
  PiSquaresFourDuotone,
  PiTriangleDuotone,
} from "react-icons/pi";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import {
  TimePicker,
  TimePickerSegment,
  TimePickerSeparator,
} from "~/components/ui/time-picker/time-field";
import { Toggle } from "~/components/ui/toggle";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { cn } from "~/lib/utils";

export const TrackerCommand = () => {
  const open = useCommandsStore((s) => s.track);
  const setOpen = useCommandsStore((s) => s.setTrack);

  const form = useForm();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[40%] max-w-2xl">
        <Form {...form}>
          <form className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <Badge className="w-max">
                Auto
                <InfoCircledIcon />
              </Badge>

              <PiShuffle size={20} className="text-muted-foreground" />

              <Button variant={"secondary"} className="w-max" type="button">
                <PiLink />
                Link from integration
              </Button>
            </div>

            <div className="mt-2 flex flex-wrap justify-between gap-4">
              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        className="max-w-full resize-none rounded-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                        placeholder="Added new features ..."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <section className="mt-2 flex items-center gap-2">
              <div className="relative flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"secondary"}
                              className={cn(
                                "h-8 min-w-64 max-w-max text-left text-sm font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "eeee, do MMMM 'at' p")
                              ) : (
                                <span>Today, now at {format(new Date(), "p")}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                          <section className="flex">
                            <div className="flex min-w-40 flex-col gap-3 p-3 text-xs">
                              <div className="flex items-center justify-center gap-2">
                                <p>At</p>
                                <TimePicker onChange={console.log} options={{ hour12: true }}>
                                  <TimePickerSegment segment={"hours"} />
                                  <TimePickerSeparator>:</TimePickerSeparator>
                                  <TimePickerSegment segment={"minutes"} />
                                </TimePicker>
                              </div>

                              <ul className="flex flex-col gap-2">
                                <Button
                                  type="button"
                                  asChild
                                  variant={"secondary"}
                                  className="bg-muted"
                                  onClick={() => {
                                    field.onChange(subDays(new Date(), 1));
                                  }}
                                >
                                  <li>
                                    <PiArrowCounterClockwise />
                                    Yesterday
                                  </li>
                                </Button>

                                <Button
                                  type="button"
                                  asChild
                                  variant={"secondary"}
                                  className="bg-muted"
                                  onClick={() => {
                                    field.onChange(subDays(new Date(), 2));
                                  }}
                                >
                                  <li>
                                    <PiArrowArcLeft />
                                    The day before
                                  </li>
                                </Button>

                                <Button
                                  type="button"
                                  asChild
                                  variant={"secondary"}
                                  className="bg-muted"
                                  onClick={() => {
                                    field.onChange(
                                      subWeeks(setDay(new Date(), 1, { weekStartsOn: 1 }), 1),
                                    );
                                  }}
                                >
                                  <li>
                                    <PiRewind />
                                    Last monday
                                  </li>
                                </Button>

                                <Button
                                  type="button"
                                  asChild
                                  variant={"secondary"}
                                  className="bg-muted"
                                  onClick={() => {
                                    field.onChange(setDate(startOfMonth(new Date()), 1));
                                  }}
                                >
                                  <li>
                                    <PiRewind />
                                    Start of month
                                  </li>
                                </Button>
                              </ul>
                            </div>

                            <Calendar
                              initialFocus
                              mode="single"
                              selected={field.value as Date}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                            />
                          </section>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>

              <p className="text-xs text-muted-foreground">took</p>

              <FormField
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TimePicker onChange={field.onChange} value={field.value as Date}>
                        <TimePickerSegment segment={"hours"} />
                        <TimePickerSeparator>hours</TimePickerSeparator>
                        <TimePickerSegment segment={"minutes"} />
                        <TimePickerSeparator>minutes</TimePickerSeparator>
                      </TimePicker>
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>

            <div className="flex items-center gap-2">
              <FormField
                name="project"
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
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Toggle size={"sm"} variant={"outline"} type="button" {...field}>
                        $ Billable
                      </Toggle>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="-ml-5 mb-1 mt-4 w-[670px]" />

            <DialogFooter>
              <Button variant="outline">Cancel</Button>

              <Button>
                Start
                <PiTriangleDuotone className="rotate-90" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
