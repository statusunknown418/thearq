import Link from "next/link";
import { redirect } from "next/navigation";
import { env } from "~/env";
import { api } from "~/trpc/server";

export default async function LinearIntegration({
  searchParams,
}: {
  searchParams: {
    code: string;
  };
}) {
  const done = await api.integrations.linear.mutate({
    code: searchParams.code,
    state: env.INTEGRATIONS_STATE,
  });

  if (done.success) {
    redirect("/");
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
