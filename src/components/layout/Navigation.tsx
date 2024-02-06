"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

export const Navigation = () => {
  const path = usePathname();
  const router = useRouter();

  return (
    <nav className="flex items-center gap-8">
      <ul>
        <Button onClick={() => router.back()} variant={"outline"} size={"icon"}>
          <ArrowLeftIcon />
        </Button>

        <Button onClick={() => router.forward()} variant={"outline"} size={"icon"}>
          <ArrowRightIcon />
        </Button>
      </ul>

      {path}
    </nav>
  );
};
