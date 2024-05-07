import { type ReactNode } from "react";
import { cn } from "~/lib/utils";

export const PageHeader = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <header
      className={cn(
        "sticky inset-0 top-0 z-50 -mx-8 flex max-h-24 min-h-24 items-start gap-5 rounded-t-3xl border-b bg-background/70 px-8 py-5 backdrop-blur backdrop-filter",
        className,
      )}
    >
      {children}
    </header>
  );
};
