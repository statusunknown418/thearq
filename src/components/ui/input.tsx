import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const inputVariants = cva(
  "flex h-9 w-full rounded-md border !border-border bg-muted px-3 py-1 text-sm shadow outline-none focus:!ring-ring transition-all file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground hover:border-primary/60 focus:ring disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive/50 aria-[invalid=true]:ring-destructive/40",
  {
    variants: {
      variant: {
        ghost: "!border-transparent !bg-transparent shadow-none",
      },
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(inputVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
