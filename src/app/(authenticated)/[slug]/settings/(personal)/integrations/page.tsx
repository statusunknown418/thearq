import { Suspense } from "react";
import { AddIntegrationsModal } from "~/components/integrations/AddIntegrationsModal";
import { Connect } from "~/components/integrations/connect";
import { IntegrationsWrapperRSC } from "~/components/integrations/wrapper";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Loader } from "~/components/ui/loader";
import { routes } from "~/lib/navigation";

export default function PersonalIntegrationsSettingsPage({ params }: { params: unknown }) {
  const { slug } = routes.integrations.$parseParams(params);

  return (
    <Main>
      <PageHeader className="items-start">
        <AddIntegrationsModal>
          <Connect to="linear" />
          <Connect to="github" />
        </AddIntegrationsModal>

        <section className="flex gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold">Integrations</h1>

            <p className="text-muted-foreground">
              Connect your account with third-party services to make your life easier and track from
              any place.
            </p>
          </div>
        </section>
      </PageHeader>

      <Suspense fallback={<Loader />}>
        <IntegrationsWrapperRSC slug={slug} />
      </Suspense>
    </Main>
  );
}
