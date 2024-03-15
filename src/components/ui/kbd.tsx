import { type ReactNode } from "react";
import { cn } from "~/lib/utils";

export const KBD = ({
  children,
  className,
  size = "sm",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  return (
    <kbd
      className={cn(
        "inline-flex w-max items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-sm border bg-background text-xs text-muted-foreground",
        size === "sm" ? "h-7 px-2 py-1" : size === "md" ? "h-8 p-2" : "h-9 p-3",
        className,
      )}
    >
      {children}
    </kbd>
  );
};
