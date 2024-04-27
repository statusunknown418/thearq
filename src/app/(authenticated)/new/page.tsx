import { GoBack } from "~/components/layout/GoBack";
import { Main } from "~/components/layout/Main";
import { NewWorkspace } from "../../../components/common/NewWorkspace";

export const dynamic = "force-static";

export default function NewWorkspacePage() {
  return (
    <Main className="grid h-screen grid-rows-[50px_auto] p-0">
      <div className="grid h-full w-full grid-cols-5 place-items-center border-b bg-muted px-10 text-muted-foreground">
        <GoBack />

        <h1 className="col-span-3 font-medium">New workspace</h1>
      </div>

      <div className="max-w-xl place-self-center px-2">
        <NewWorkspace />
      </div>
    </Main>
  );
}
