"use client";

import { PersonIcon } from "@radix-ui/react-icons";
import { PiAcorn, PiNote } from "react-icons/pi";
import { buttonVariants } from "~/components/ui/button";
import { steps, useInvoicesQS } from "../invoices-cache";
import { cn } from "~/lib/utils";
import { Fragment, type ReactNode } from "react";
import { GeneralSection } from "./General";
import { ItemsSection } from "./Items";
import { NotesSection } from "./Notes";

export const renderers: Record<(typeof steps)[number], ReactNode> = {
  general: <GeneralSection />,
  items: <ItemsSection />,
  notes: <NotesSection />,
};

export const Stepper = () => {
  const labeledSteps: { key: (typeof steps)[number]; label: string; icon: ReactNode }[] = [
    { key: "general", label: "General", icon: <PersonIcon /> },
    { key: "items", label: "Items", icon: <PiAcorn /> },
    { key: "notes", label: "Notes", icon: <PiNote /> },
  ];

  const [{ step }] = useInvoicesQS();

  const currentIndex = labeledSteps.findIndex((s) => s.key === step);

  const visitedSteps = labeledSteps.slice(0, currentIndex);

  return (
    <section className="mb-2 flex items-center justify-between">
      {labeledSteps.map((s, i) => (
        <Fragment key={s.label}>
          <article key={i} className="flex items-center gap-2 text-xs">
            <div
              className={buttonVariants({
                size: "icon",
                variant: visitedSteps.includes(s) ? "default" : "secondary",
                className: cn(
                  "pointer-events-none cursor-default",
                  currentIndex === i && "!border-ring",
                ),
              })}
            >
              {s.icon}
            </div>

            <p className={visitedSteps.includes(s) ? "text-foreground" : "text-muted-foreground"}>
              {s.label}
            </p>
          </article>

          {i < steps.length - 1 && (
            <div
              className={cn("mx-2 h-px w-full", visitedSteps.includes(s) ? "bg-ring" : "bg-border")}
            />
          )}
        </Fragment>
      ))}
    </section>
  );
};
