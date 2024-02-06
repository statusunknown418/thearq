import { NewWorkspace } from "../workspaces/_ui/NewWorkspace";

export default function NewWorkspacePage() {
  return (
    <main className="grid h-screen grid-rows-12 bg-base-200">
      <div className="bg-muted row-span-1 h-full w-full place-self-start border-b">
        <h2>New workspace</h2>
      </div>

      <div className="row-span-10 max-w-xl place-self-center px-2">
        <NewWorkspace />
      </div>
    </main>
  );
}
