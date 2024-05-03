"use client";
import { useEffect, useState } from "react";
import { computeDuration, convertTime } from "~/lib/dates";
import { cn } from "~/lib/utils";

export const RealtimeCounter = ({
  start,
  className,
  idle,
}: {
  start: Date;
  className?: string;
  idle?: boolean;
}) => {
  const [duration, setDuration] = useState(() => computeDuration({ start, end: new Date() }));

  useEffect(() => {
    if (idle) return;

    const interval = setInterval(() => {
      setDuration(() => computeDuration({ start, end: new Date() }));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [start, idle]);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="aspect-square h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 duration-1000" />
      <p className="text-sm tabular-nums">{convertTime(duration, { includeSeconds: true })}</p>
    </div>
  );
};
