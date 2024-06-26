"use client";

import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { routes } from "~/lib/navigation";
import { toast } from "sonner";
import { Loader } from "../ui/loader";

export const AcceptInvite = ({ userEmail, slug }: { userEmail: string; slug: string }) => {
  const router = useRouter();

  const { mutate, error, isLoading } = api.workspaces.acceptInvitation.useMutation({
    onSuccess: ({ data }) => {
      data?.role === "admin" && router.push(routes.dashboard({ slug }));
      data?.role === "member" && router.push(routes.tracker({ slug, search: {} }));
    },
    onError: ({ message }) => {
      toast.error("Error", {
        description: message,
      });
    },
  });

  return (
    <>
      {error?.message && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center text-xs text-destructive">
          Oops, something happened, the link may have be invalid or you are already a member of this
          workspace.
        </p>
      )}

      <Button
        size="lg"
        onClick={() =>
          mutate({
            userEmail,
            workspaceSlug: slug,
          })
        }
      >
        {isLoading && <Loader />}
        Join
      </Button>
    </>
  );
};
