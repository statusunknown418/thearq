import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-2 select-none justify-center whitespace-nowrap rounded-md text-xs font-medium transition-all outline-none focus-visible:ring focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-foreground bg-indigo-600 active:shadow-none hover:bg-indigo-600/90 active:bg-indigo-700 active:ring-2 active:ring-offset-1 border border-indigo-700 hover:border-indigo-500 active:ring-offset-indigo-500 active:ring-indigo-300",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border border-red-700 hover:bg-destructive/85 active:bg-destructive/70 hover:border-destructive/85 active:ring-2 active:ring-red-400",
        outline:
          "border bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/85",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent/60 transition-colors hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9 flex-none",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {props.children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
