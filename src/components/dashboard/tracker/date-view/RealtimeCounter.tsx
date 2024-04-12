"use client";
import { useEffect, useState } from "react";
import { computeDuration, convertTime } from "~/lib/stores/events-store";
import { cn } from "~/lib/utils";

export const RealtimeCounter = ({ start, className }: { start: Date; className?: string }) => {
  const [duration, setDuration] = useState(() => computeDuration({ start, end: new Date() }));

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(() => computeDuration({ start, end: new Date() }));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [start]);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="aspect-square h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 duration-1000" />
      <p className="text-sm tabular-nums">{convertTime(duration, { includeSeconds: true })}</p>
    </div>
  );
};
