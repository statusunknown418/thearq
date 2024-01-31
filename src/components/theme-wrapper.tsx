"use client";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";

export const ThemeWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      themes={["light", "cupcake", "night", "dark"]}
      defaultTheme="system"
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
};
