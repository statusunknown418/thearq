"use client";

import { ArrowLeftIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { routes } from "~/lib/navigation";

export default function WorkspacePageError({ error }: { error: Error & { digest?: string } }) {
  return (
    <section className="grid h-screen grid-cols-1 place-items-center bg-base-300">
      <div className="grid grid-cols-1 place-items-center gap-2 rounded-lg border bg-base-100 p-10 shadow-xl">
        <ExclamationTriangleIcon className="h-10 w-10 text-error" />

        <h2 className="text-2xl font-bold">There was an error</h2>

        <p className="kbd text-xs">{error.message}</p>

        <Button asChild className="mt-4">
          <Link href={routes.allWorkspaces()}>
            <ArrowLeftIcon />
            Back to app
          </Link>
        </Button>
      </div>
    </section>
  );
}
