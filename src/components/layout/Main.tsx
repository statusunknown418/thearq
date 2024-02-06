import { type ReactNode } from "react";

export const Main = ({ children }: { children: ReactNode }) => {
  return <main className="flex min-w-0 flex-col">{children}</main>;
};
