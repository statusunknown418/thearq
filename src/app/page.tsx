import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { useAuthStore } from "~/lib/stores/auth-store";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  noStore();
  const t1 = performance.now();
  const session = await getServerAuthSession();
  const t2 = performance.now();
  const user = useAuthStore.getState().user;

  return (
    <main className="flex flex-col items-center justify-center">
      <h1>Better user with no fetches</h1>
      <p>{JSON.stringify(user, null, 2)}</p>
      <h2 className="text-2xl font-bold">Regular getAuth took {t2 - t1}ms</h2>
      <p>{JSON.stringify(session, null, 2)}</p>

      <Link href={user ? "/api/auth/signout" : "/api/auth/signin"}>
        Sign {user ? "out" : "in"}
      </Link>
    </main>
  );
}
