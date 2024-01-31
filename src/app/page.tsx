import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { ThemeSwitcher } from "~/components/theme-switcher";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { getServerAuthSession } from "~/server/auth";
import { Connect } from "./_ui/connect";
import { CreatePost } from "./_ui/create-post";
import { WorkspacesList } from "./_ui/workspaces-list";

export default async function Home() {
  unstable_noStore();
  const t1 = performance.now();
  const session = await getServerAuthSession();
  const t2 = performance.now();
  const date = Date.now();

  return (
    <main className="flex flex-col items-center justify-center">
      <h1>Better user with no fetches</h1>
      <h2 className="text-2xl font-bold">Regular getAuth took {t2 - t1}ms</h2>
      <p>{JSON.stringify(session, null, 2)}</p>

      <p>{date.toString()}</p>

      <Suspense fallback={<Loader />}>
        <WorkspacesList />
      </Suspense>

      <Loader />

      <Button>Btn 1</Button>
      <Button variant={"destructive"}>BTN 1</Button>
      <Button variant={"ghost"}>Some 1</Button>
      <Button variant={"link"}>BTN 1</Button>
      <Button variant={"outline"}>BTN 1</Button>
      <Button variant={"secondary"}>BTN 1</Button>

      <Input className="w-max" />

      <CreatePost />

      <Connect to="linear" />
      <Connect to="github" />

      <ThemeSwitcher />
    </main>
  );
}
