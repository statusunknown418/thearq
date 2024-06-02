import { Suspense } from "react";
import { InvitationDetailsWrapperRSC } from "~/components/join/details-wrapper";
import { GoBack } from "~/components/layout/GoBack";
import { Main } from "~/components/layout/Main";

export default function JoinWorkspacePage({ params }: { params: unknown }) {
  return (
    <Main className="grid h-screen grid-rows-[50px_auto] p-0">
      <div className="grid h-full w-full grid-cols-5 place-items-center border-b bg-secondary px-10 text-muted-foreground">
        <GoBack to="/" />

        <h1 className="col-span-3 font-medium">Join a workspace</h1>
      </div>

      <div className="max-w-xl place-self-center px-2">
        <Suspense>
          <InvitationDetailsWrapperRSC params={params} />
        </Suspense>
      </div>
    </Main>
  );
}
