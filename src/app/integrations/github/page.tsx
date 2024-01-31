import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function GithubIntegration({
  searchParams,
}: {
  searchParams: {
    code: string;
    state: string;
  };
}) {
  const done = await api.integrations.github.mutate(searchParams);

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
