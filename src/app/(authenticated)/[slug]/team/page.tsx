import { Suspense } from "react";
import { PiUsersDuotone } from "react-icons/pi";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { PersonDetailsSheet } from "~/components/team/PersonDetailsSheet";
import { CapacityLoading, CapacityWrapperRSC } from "~/components/team/capacity/capacity-wrapper";
import {
  InvitationLoading,
  InvitationWrapperRSC,
} from "~/components/team/invite/invitation-wrapper";
import { TeamTableLoading, TeamTableWrapperRSC } from "~/components/team/table/table-wrapper";
import { routes } from "~/lib/navigation";

export default function WorkspacePeoplePage({ params }: { params: unknown }) {
  const { slug } = routes.people.$parseParams(params);

  return (
    <Main>
      <PageHeader>
        <PiUsersDuotone size={24} className="text-indigo-500" />

        <h1 className="text-lg font-semibold">Team</h1>
      </PageHeader>

      <Suspense fallback={<TeamTableLoading />}>
        <TeamTableWrapperRSC />
      </Suspense>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<InvitationLoading />}>
          <InvitationWrapperRSC slug={slug} />
        </Suspense>

        <Suspense fallback={<CapacityLoading />}>
          <CapacityWrapperRSC />
        </Suspense>
      </section>

      <PersonDetailsSheet />
    </Main>
  );
}
