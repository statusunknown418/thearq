import { UpdateIcon } from "@radix-ui/react-icons";
import { cn } from "~/lib/utils";

export const Loader = ({ sm = true, md, lg }: { sm?: boolean; md?: boolean; lg?: boolean }) => {
  return (
    <UpdateIcon
      className={cn(
        "animate-spin text-muted-foreground",
        sm && "h-4 w-4",
        md && "h-6 w-6",
        lg && "h-8 w-8",
      )}
    />
  );
};
