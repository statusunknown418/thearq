"use client";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";

export const ThemeWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="dark"
      enableSystem={false}
      attribute="class"
    >
      {children}
    </ThemeProvider>
  );
};
