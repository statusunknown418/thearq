import { Suspense } from "react";
import { PiUsersDuotone } from "react-icons/pi";
import { PersonDetailsSheet } from "~/components/dashboard/team/PersonDetailsSheet";
import {
  InvitationLoading,
  InvitationWrapperRSC,
} from "~/components/dashboard/team/invite/invitation-wrapper";
import {
  TeamTableLoading,
  TeamTableWrapperRSC,
} from "~/components/dashboard/team/table/table-wrapper";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { routes } from "~/lib/navigation";

export default async function WorkspacePeoplePage({ params }: { params: unknown }) {
  const { slug } = routes.people.$parseParams(params);

  return (
    <Main className="gap-8">
      <PageHeader className="items-start">
        <PiUsersDuotone size={30} className="text-green-400" />

        <section className="flex gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold">Team</h1>

            <p className="text-muted-foreground">
              Manage team rates, internal costs and invite more people to your workspace.
            </p>
          </div>
        </section>
      </PageHeader>

      <Suspense fallback={<TeamTableLoading />}>
        <TeamTableWrapperRSC />
      </Suspense>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<InvitationLoading />}>
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
