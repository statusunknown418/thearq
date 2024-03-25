"use client";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";

export const ThemeWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      enableSystem={false}
      attribute="class"
    >
      {children}
    </ThemeProvider>
  );
};
