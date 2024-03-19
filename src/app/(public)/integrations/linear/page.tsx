import { cookies } from "next/headers";
import Link from "next/link";
import { ClientRedirect } from "~/components/ClientRedirect";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { RECENT_WORKSPACE_KEY } from "~/lib/constants";
import { api } from "~/trpc/server";

export default async function LinearIntegration({
  searchParams,
}: {
  searchParams: {
    code: string;
  };
}) {
  const workspace = cookies().get(RECENT_WORKSPACE_KEY)?.value;

  if (!workspace) {
    return (
      <div>
        <p>You haven&apos;t selected a workspace</p>

        <Button asChild>
          <Link href="/">Go back</Link>
        </Button>
      </div>
    );
  }

  const done = await api.integrations.linear.mutate({
    code: searchParams.code,
    state: env.INTEGRATIONS_STATE,
    workspace,
  });

  if (done.success) {
    return <ClientRedirect />;
  }

  if (done.error) {
    return (
      <div>
        <p>Something went wrong</p>

        <p>{JSON.stringify(done.error, null, 2)}</p>

        <Link href="/" className="btn">
          Go back
        </Link>
      </div>
    );
  }
}
