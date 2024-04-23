import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import ResizableTextarea, { type TextareaAutosizeProps } from "react-textarea-autosize";
import { cn } from "~/lib/utils";

const textareaVariants = cva(
  "flex min-h-[48px] w-full rounded-md border bg-muted px-3 py-2 hover:border-primary shadow placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        ghost: "border-transparent bg-transparent shadow-none",
      },
    },
  },
);

export interface TextareaProps
  extends TextareaAutosizeProps,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <ResizableTextarea
        className={cn(textareaVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
