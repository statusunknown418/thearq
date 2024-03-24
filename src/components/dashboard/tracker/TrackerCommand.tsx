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
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { TimePickerInput } from "~/components/ui/time-picker/time-picker-input";
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
                        className="max-w-full resize-none rounded-none border-none bg-transparent p-0 text-sm focus-visible:ring-0"
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
                              variant={"outline"}
                              className={cn(
                                "h-9 min-w-64 max-w-max text-left text-sm font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPPP")
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
                              <div className="flex flex-col gap-1 border-b pb-3">
                                <Input type="time" autoFocus={false} />
                              </div>

                              <ul className="flex flex-col gap-2">
                                <Button
                                  type="button"
                                  asChild
                                  variant={"outline"}
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
                                  variant={"outline"}
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
                                  variant={"outline"}
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
                                  variant={"outline"}
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
                  <FormItem className="flex-row items-center rounded-md border pl-1 pr-3">
                    <TimePickerInput
                      className="w-8 border-none bg-transparent p-0"
                      picker="hours"
                      date={undefined}
                      setDate={(d) => console.log(d)}
                    />

                    <p className="text-xs text-muted-foreground">hours</p>

                    <TimePickerInput
                      className="w-8 border-none bg-transparent p-0"
                      picker="minutes"
                      date={undefined}
                      setDate={(d) => console.log(d)}
                    />

                    <p className="text-xs text-muted-foreground">minutes</p>
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
                    <Toggle size={"sm"} variant={"outline"} type="button">
                      $ Billable
                    </Toggle>
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
