"use client";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export const GoBack = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      variant={"ghost"}
      className="col-span-1 justify-self-start"
    >
      <ArrowLeftIcon />
      Back
    </Button>
  );
};
