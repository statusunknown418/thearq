import { type ReactNode } from "react";
import { cn } from "~/lib/utils";

/**
 * Wrapper for all pages, already contains flex-col, min-w-0
 * @param gap 0px by default
 * @param p 8 and 5rem by default (x, y)
 * @returns
 */
export const Main = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <main className={cn("flex h-full min-w-0 flex-col gap-6 px-8 pb-5", className)}>
      {children}
    </main>
  );
};
