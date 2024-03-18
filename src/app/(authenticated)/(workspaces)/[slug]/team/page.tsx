import { Suspense } from "react";
import { PiUsersDuotone } from "react-icons/pi";
import { PersonDetailsSheet } from "~/components/dashboard/team/PersonDetailsSheet";
import {
  InvitationWrapperRSC,
  WrapperLoader,
} from "~/components/dashboard/team/invitation-wrapper";
import { TeamTableWrapperRSC } from "~/components/dashboard/team/table/table-wrapper";
import { Main } from "~/components/layout/Main";
import { Loader } from "~/components/ui/loader";
import { routes } from "~/lib/navigation";

export default async function WorkspacePeoplePage({ params }: { params: unknown }) {
  const { slug } = routes.people.$parseParams(params);

  return (
    <Main className="gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <PiUsersDuotone size={30} className="text-green-400" />
          <h1 className="text-3xl font-semibold">Team</h1>
        </div>

        <p className="text-muted-foreground">
          Manage team rates, internal costs and invite more people to your workspace.
        </p>
      </header>

      <Suspense fallback={<Loader />}>
        <TeamTableWrapperRSC />
      </Suspense>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<WrapperLoader />}>
          <InvitationWrapperRSC slug={slug} />
        </Suspense>

        <div>
          <header>Capacity</header>
          <p>You have X teammates left on your current plan</p>
        </div>
      </section>

      <PersonDetailsSheet />
    </Main>
  );
}
