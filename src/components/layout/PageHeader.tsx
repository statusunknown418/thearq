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
        "sticky inset-0 top-0 z-50 -mx-6 flex max-h-20 min-h-20 items-start gap-5 rounded-t-3xl border-b bg-background/70 px-6 py-3 backdrop-blur backdrop-filter",
        className,
      )}
    >
      {children}
    </header>
  );
};
