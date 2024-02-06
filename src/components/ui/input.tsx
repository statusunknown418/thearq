import * as React from "react";

import { cn } from "~/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border bg-input px-3 py-1 text-xs shadow-sm outline-none ring-ring transition-all file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus:ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive/50 aria-[invalid=true]:ring-destructive/40",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
