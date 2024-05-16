"use client";

import { ArrowLeftIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { PiArrowClockwise } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { routes } from "~/lib/navigation";

export default function WorkspacePageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="grid h-screen grid-cols-1 place-items-center">
      <div className="grid grid-cols-1 place-items-center gap-2 rounded-lg border bg-muted p-10 shadow-xl">
        <ExclamationTriangleIcon className="h-10 w-10 text-destructive" />

        <h2 className="text-2xl font-bold">There was an error</h2>

        <KBD>{error.digest}</KBD>

        <p className="kbd text-muted-foreground">
          Oh crap, something happened, please let us know{" "}
          <Link
            href={
              "mailto:alvaro.aquije@icloud.com?subject=Error%20Report%20-%20Digest%3A%20" +
              error.digest
            }
            className="text-indigo-500 underline underline-offset-1 dark:text-indigo-400"
          >
            here
          </Link>{" "}
          (code already included in the subject 🫡)
        </p>

        <div className="mt-5 flex items-center gap-2">
          <Button asChild variant={"outline"}>
            <Link href={routes.allWorkspaces()}>
              <ArrowLeftIcon />
              Back
            </Link>
          </Button>

          <p>or</p>

          <Button variant={"primary"} onClick={reset}>
            <PiArrowClockwise />
            Reload
          </Button>
        </div>
      </div>
    </section>
  );
}
