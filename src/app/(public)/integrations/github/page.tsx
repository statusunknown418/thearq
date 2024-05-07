import { cookies } from "next/headers";
import Link from "next/link";
import { ClientRedirect } from "~/components/ClientRedirect";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { env } from "~/env";
import { RECENT_WORKSPACE_KEY } from "~/lib/constants";
import { routes } from "~/lib/navigation";
import { api } from "~/trpc/server";

export default async function GithubIntegration({
  searchParams,
}: {
  searchParams: {
    code: string;
    state: string;
  };
}) {
  const workspace = cookies().get(RECENT_WORKSPACE_KEY)?.value;

  if (!workspace) {
    return (
      <div>
        <p>You haven&apos;t selected a workspace</p>

        <Button asChild>
          <Link href={routes.home()}>Go back</Link>
        </Button>
      </div>
    );
  }

  if (!searchParams.code) {
    return (
      <div>
        <p>Invalid request</p>

        <p>
          Missing <KBD>Code</KBD>
        </p>

        <Button asChild>
          <Link href={routes.home()}>Go back</Link>
        </Button>
      </div>
    );
  }

  const done = await api.integrations.github.mutate({
    code: searchParams.code,
    workspace,
  });

  if (done.success) {
    return <ClientRedirect />;
  }

  if (done.error) {
    return (
      <div>
        <p>Something went wrong</p>

        <p>{JSON.stringify(done.error.cause, null, 2)}</p>

        <Link href={routes.home()} className="btn">
          Go back
        </Link>
      </div>
    );
  }
}
