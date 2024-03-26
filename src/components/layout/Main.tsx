import { type ReactNode } from "react";
import { cn } from "~/lib/utils";

/**
 * Wrapper for all pages, already contains flex-col, min-w-0
 * @param gap 0px by default
 * @param p 10rem by default
 * @returns 
 */
export const Main = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <main className={cn("flex h-full min-w-0 flex-col gap-8 px-10 py-5", className)}>
      {children}
    </main>
  );
};
