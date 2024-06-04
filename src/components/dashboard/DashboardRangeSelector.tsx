"use client";

import { format, toDate } from "date-fns-tz";
import { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";
import { RangePicker } from "../ui/range-picker";
import { useDashboardQS } from "./dashboard-cache";

export const DashboardRangeSelector = () => {
  const [state, update] = useDashboardQS();

  const [open, setOpen] = useState(false);

  const [date, setDate] = useState<DateRange | undefined>({
    from: state.from ? toDate(state.from) : undefined,
    to: state.to ? toDate(state.to) : undefined,
  });

  const onBlurOrSelect = async () => {
    if (!date?.from && !date?.to) {
      return;
    }

    if (date.from && !date.to) {
      return toast.error("Please select a date range");
    }

    const start = date.from ? format(date.from, "yyyy-MM-dd") : undefined;
    const end = date.to ? format(date.to, "yyyy-MM-dd") : undefined;

    void update({
      from: start,
      to: end,
    });
  };

  const onOpenChange = (v: boolean) => {
    if (!v) {
      void onBlurOrSelect();
    }

    setOpen(v);
  };

  useEffect(() => {
    if (state.from && state.to) {
      setDate({
        from: toDate(state.from),
        to: toDate(state.to),
      });
    }
  }, [state.from, state.to]);

  return (
    <RangePicker
      disableAfter
      className="ml-auto rounded-md"
      open={open}
      date={date}
      onOpenChange={onOpenChange}
      onDateChange={setDate}
    />
  );
};
