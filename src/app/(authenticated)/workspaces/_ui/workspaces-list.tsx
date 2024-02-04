import { ArrowRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { APP_URL } from "~/lib/constants";
import { routes } from "~/lib/navigation";
import { api } from "~/trpc/server";

export const WorkspacesList = async () => {
  const workspaces = await api.workspaces.get.query();

  return (
    <ul className="grid grid-cols-1 rounded-lg">
      {workspaces.map((relation) => (
        <li key={relation.workspaceSlug}>
          <Link
            href={routes.dashboard({ slug: relation.workspaceSlug })}
            className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-base-200"
          >
            <Image
              src={relation.workspace.image ?? "https://picsum.photos/200"}
              alt={relation.workspace.name}
              width={44}
              height={44}
              className="rounded-md"
            />

            <div className="flex-grow transition-transform group-hover:translate-x-1">
              <h3 className="text-sm font-medium">{relation.workspace.name}</h3>
              <p className="text-muted-foreground text-xs">
                {APP_URL}/{relation.workspaceSlug}
              </p>
            </div>

            <span className="hidden pr-6 transition-all group-hover:block group-hover:translate-x-2 group-hover:animate-in">
              <ArrowRightIcon className="h-4 w-4 text-primary" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
