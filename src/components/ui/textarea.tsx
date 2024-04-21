import * as React from "react";

import ResizableTextarea, { type TextareaAutosizeProps } from "react-textarea-autosize";
import { cn } from "~/lib/utils";

export type TextareaProps = TextareaAutosizeProps;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <ResizableTextarea
        className={cn(
          "flex min-h-[48px] w-full rounded-md border bg-muted px-3 py-2 shadow placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
