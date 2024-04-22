"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState } from "react";
import { PiCheckBold, PiCopyDuotone } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "./button";

export const CopyButton = ({
  text,
  className,
  toastText,
  ...props
}: {
  text: string;
  className?: string;
  toastText?: string;
} & React.ComponentProps<"button">) => {
  const [copied, setCopied] = useState(false);
  const [parent] = useAutoAnimate();

  const onClick = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(toastText ?? "Copied to clipboard");

    setTimeout(() => {
      setCopied(false);
    }, 4000);
  };

  return (
    <Button
      variant={"secondary"}
      size={"icon"}
      onClick={onClick}
      className={className}
      {...props}
      ref={parent}
    >
      {copied ? (
        <PiCheckBold size={15} className="text-green-600 dark:text-green-500" />
      ) : (
        <PiCopyDuotone size={15} />
      )}
    </Button>
  );
};
