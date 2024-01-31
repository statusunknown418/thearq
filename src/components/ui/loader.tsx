import { cn } from "~/lib/utils";

export const Loader = ({
  sm = true,
  md,
  lg,
}: {
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
}) => {
  return (
    <div
      className={cn("loading loading-infinity", {
        "loading-sm": sm,
        "loading-md": md,
        "loading-lg": lg,
      })}
    />
  );
};
