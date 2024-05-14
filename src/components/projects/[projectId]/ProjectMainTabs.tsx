"use client";
import { type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useProjectsQS } from "./project-cache";

export const ProjectMainTabs = ({ children }: { children: ReactNode }) => {
  const [{ tab }, update] = useProjectsQS();

  const onTabChange = (value: string) => {
    void update({ tab: value });
  };

  return (
    <Tabs defaultValue={tab} onValueChange={onTabChange}>
      <div className="flex w-full justify-between">
        <TabsList className="sticky left-0 top-0 max-w-max">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="analytics">Hours</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </div>

      {children}
    </Tabs>
  );
};
