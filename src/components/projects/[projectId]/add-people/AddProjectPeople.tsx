import { PlusIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuthStore } from "~/lib/stores/auth-store";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const AddProjectPeople = ({
  projectTeam,
}: {
  projectTeam: RouterOutputs["projects"]["getTeam"];
}) => {
  const user = useAuthStore((s) => s.user);

  const utils = api.useUtils();
  const { data, isLoading } = api.teams.getByWorkspace.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    mutate,
    isLoading: isAdding,
    isSuccess,
  } = api.projects.addUser.useMutation({
    onSuccess: () => {
      void utils.projects.getTeam.invalidate();
      toast.success("User added to project");
    },
    onError: (err) => {
      toast.error("Failed to add user to project", {
        description: err.message,
      });
    },
  });

  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);

  const computedData = useMemo(
    () =>
      data?.table
        ?.filter((u) => u.userId !== user?.id)
        .filter((u) => u.user?.name?.toLowerCase().includes(deferred.toLowerCase())),

    [data, deferred, user?.id],
  );

  if (isLoading) {
    return <Skeleton className="h-8 w-28" />;
  }

  if (!data) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">
            <PlusIcon />
            Add people
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add people to this project</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            No team found in your workspace, this is probably unexpected, please contact us 😥
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusIcon />
          Add people
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add people to this project</DialogTitle>

          <DialogDescription>Choose from the team already in your workspace</DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search by name"
          className="w-full"
          onChange={(e) => setSearch(e.target.value)}
        />

        <ScrollArea className="grid max-h-96 grid-cols-1 gap-4 rounded-lg border bg-background">
          {!computedData?.length && (
            <li className="flex h-14 w-full items-center justify-center gap-2  px-4 py-2 text-muted-foreground">
              <span>No results</span>
            </li>
          )}

          {computedData?.map((relation, idx) => (
            <li
              key={relation.userId}
              className={cn(
                "flex w-full items-center gap-2 border-b px-4 py-3",
                idx === computedData?.length - 1 ? "border-b-0" : "",
              )}
            >
              {relation.user.image && (
                <Image
                  src={relation.user.image}
                  alt={relation.user.name ?? ""}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}

              <span>{relation.user.name}</span>

              {!!projectTeam.users.find((u) => u.userId === relation.userId) ||
                (isSuccess && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="ml-auto"
                    disabled={isAdding}
                    onClick={() => {
                      mutate({
                        projectId: projectTeam.id,
                        userId: relation.userId,
                      });
                    }}
                  >
                    {isAdding ? <Loader /> : <PlusIcon />}
                  </Button>
                ))}
            </li>
          ))}
        </ScrollArea>

        <DialogDescription className="mt-2">
          Keep in mind that when adding people to a project the values used for their billable rate
          and internal cost are the ones set in the
          <Link
            href={"../team"}
            className="ml-1 text-indigo-500 underline-offset-1 hover:underline dark:text-indigo-400"
          >
            workspace team settings.
          </Link>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
