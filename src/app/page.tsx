import { unstable_noStore } from "next/cache";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { auth } from "~/server/auth";

export default async function Home() {
  unstable_noStore();
  const t1 = performance.now();
  const session = await auth();
  const t2 = performance.now();
  const date = Date.now();

  return (
    <main className="flex flex-col items-center justify-center">
      <h1>Better user with no fetches</h1>
      <h2 className="text-2xl font-bold">Regular getAuth took {t2 - t1}ms</h2>
      <p>{JSON.stringify(session, null, 2)}</p>

      <p>{date.toString()}</p>

      <Loader />

      <Button>Btn 1</Button>
      <Button variant={"destructive"}>BTN 1</Button>
      <Button variant={"ghost"}>Some 1</Button>
      <Button variant={"link"}>BTN 1</Button>
      <Button variant={"outline"}>BTN 1</Button>
      <Button variant={"secondary"}>BTN 1</Button>

      <Input className="w-max" />
    </main>
  );
}
