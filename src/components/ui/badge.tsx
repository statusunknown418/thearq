import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex whitespace-nowrap items-center cursor-default uppercase gap-1 h-6 max-h-6 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80",
        destructive:
          "text-red-700 bg-red-100 hover:bg-red-100/90 border border-red-400 hover:border-red-600",
        outline: "text-foreground",
        primary:
          "text-white dark:text-foreground bg-indigo-600 hover:bg-indigo-600/90 border border-indigo-700 hover:border-indigo-500",
        success:
          "text-emerald-700 bg-emerald-100 hover:bg-emerald-100/90 border border-emerald-400 hover:border-emerald-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
