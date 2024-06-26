"use client";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { routes } from "~/lib/navigation";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const List = ({
  workspaces,
  baseUrl,
}: {
  workspaces: RouterOutputs["workspaces"]["get"];
  baseUrl: string;
}) => {
  const { data } = api.workspaces.get.useQuery(undefined, {
    initialData: workspaces,
  });

  const { mutate } = api.workspaces.setRecent.useMutation();

  return (
    <ul className="grid max-h-80 grid-cols-1 gap-1 overflow-y-auto rounded-lg">
      {data.map((relation) => (
        <li key={relation.workspaceId}>
          <Link
            onClick={() => {
              mutate({
                workspaceSlug: relation.workspace.slug,
                workspaceId: relation.workspace.id,
              });
            }}
            href={routes.dashboard({ slug: relation.workspace.slug })}
            className="hover:bg-base-200 group flex items-center gap-4 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary-background"
          >
            <Image
              src={relation.workspace.image ?? "https://picsum.photos/200"}
              alt={relation.workspace.name}
              width={44}
              height={44}
              className="rounded-md"
            />

            <div className="flex-grow transition-transform group-hover:translate-x-1">
              <h3 className="text-xs font-medium">{relation.workspace.name}</h3>
              <p className="text-xs text-muted-foreground">
                {baseUrl}/{relation.workspace.slug}
              </p>
            </div>

            <span className="hidden pr-6 transition-all group-hover:block group-hover:translate-x-2 group-hover:animate-in">
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
