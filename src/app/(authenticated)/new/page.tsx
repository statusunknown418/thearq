import { GoBack } from "~/components/layout/GoBack";
import { NewWorkspace } from "../(workspaces)/_ui/NewWorkspace";

export const dynamic = "force-static";

export default function NewWorkspacePage() {
  return (
    <main className="bg-base-200 grid h-screen grid-rows-[50px_auto]">
      <div className="grid h-full w-full grid-cols-5 place-items-center border-b bg-muted px-10 text-muted-foreground">
        <GoBack />

        <h1 className="col-span-3 font-medium">New workspace</h1>
      </div>

      <div className="max-w-xl place-self-center px-2">
        <NewWorkspace />
      </div>
    </main>
  );
}
