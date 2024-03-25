import * as React from "react";

import { cn } from "~/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border bg-muted px-3 py-1 text-sm shadow outline-none ring-ring transition-all file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground hover:border-primary/60 focus:ring disabled:cursor-not-allowed disabled:opacity-40 aria-[invalid=true]:border-destructive/50 aria-[invalid=true]:ring-destructive/40",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
