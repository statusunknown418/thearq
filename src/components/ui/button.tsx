import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-1.5 select-none justify-center whitespace-nowrap text-xs font-medium transition-all outline-none focus-visible:ring focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "dark:text-foreground text-white bg-indigo-600 active:shadow-none hover:bg-indigo-600/90 active:bg-indigo-700 active:ring-2 active:ring-offset-1 border border-indigo-700 dark:hover:border-indigo-500 hover:border-indigo-400 active:ring-offset-indigo-500 active:ring-indigo-300",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border border-red-700 hover:bg-destructive/85 active:bg-destructive/70 hover:border-destructive/85 active:ring-2 active:ring-red-400",
        outline:
          "border bg-background shadow-sm hover:bg-accent/30 hover:text-accent-foreground active:bg-accent/20 active:border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/50 border border-border/50 dark:border-border-contrast/70 hover:border-primary/50 dark:hover:border-border-contrast active:border-border active:bg-secondary",
        ghost:
          "hover:bg-accent/70 hover:border-primary/60 dark:hover:border-primary/20 transition-colors border border-transparent active:border-border hover:text-accent-foreground",
        link: "text-indigo-600 dark:text-indigo-400 underline-offset-1 hover:underline dark:hover:text-indigo-400 hover:text-indigo-500 dark:text-indigo-400",
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/85 active:bg-primary/70",
      },
      size: {
        default: "h-8 rounded-sm px-3 py-2",
        sm: "h-7 rounded-sm px-2 text-xs",
        lg: "h-9 rounded-md px-3",
        icon: "h-8 w-8 flex-none rounded-sm",
      },
      subSize: {
        iconSm: "h-6 w-6 rounded",
        iconXs: "h-5 w-5",
        iconBase: "h-8 w-8",
        iconMd: "h-9 w-9",
        iconLg: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, subSize, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, subSize, className }))}
        ref={ref}
        {...props}
      >
        {props.children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
