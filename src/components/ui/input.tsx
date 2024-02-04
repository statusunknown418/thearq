import * as React from "react";

import { cn } from "~/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "h-8 rounded-md border border-base-300 bg-base-200 px-4 text-sm shadow transition-all focus:border-indigo-500 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 aria-[invalid=true]:border-error aria-[invalid=true]:bg-error/5 aria-[invalid=true]:focus:ring-error/30 dark:placeholder:text-gray-600",
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
