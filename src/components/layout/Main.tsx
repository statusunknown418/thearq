import { type ReactNode } from "react";
import { cn } from "~/lib/utils";

export const Main = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <main className={cn("flex min-w-0 flex-col p-3", className)}>{children}</main>;
};
