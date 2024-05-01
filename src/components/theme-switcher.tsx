"use client";

import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";
import { useState } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { cn } from "~/lib/utils";
import { Label } from "./ui/label";

/**
 * This will become a more complex theme switcher later on with
 * dark, light, user based?, linear based themes
 * @returns
 */
export const ThemeSwitcher = () => {
  const { setTheme, theme } = useTheme();
  const [checked, setChecked] = useState(theme === "light");

  const onCheckedChange = (checked: boolean) => {
    setChecked(checked);
    setTheme(checked ? "light" : "dark");
  };

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      <div className="flex w-full max-w-md justify-between py-2">
        <Label htmlFor="theme" className="text-muted-foreground">
          App theme
        </Label>

        <div className="flex items-center gap-2">
          <MoonIcon className={cn("h-4 w-4")} />

          <Switch checked={checked} onCheckedChange={onCheckedChange} id="theme" />

          <SunIcon className={cn("h-4 w-4")} />
        </div>
      </div>
    </div>
  );
};
