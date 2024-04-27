import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
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
