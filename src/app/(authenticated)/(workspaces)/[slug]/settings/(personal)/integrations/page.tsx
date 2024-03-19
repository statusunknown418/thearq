import { PlusIcon } from "@radix-ui/react-icons";
import { Suspense } from "react";
import { PiPlugDuotone } from "react-icons/pi";
import { IntegrationsWrapperRSC } from "~/components/integrations/wrapper";
import { Main } from "~/components/layout/Main";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { routes } from "~/lib/navigation";

export default function PersonalIntegrationsSettingsPage({ params }: { params: unknown }) {
  const { slug } = routes.integrations.$parseParams(params);

  return (
    <Main>
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <PiPlugDuotone size={30} />
          <h1 className="flex-grow text-3xl font-semibold">Integrations</h1>

          <Button>
            <PlusIcon />
            Add
          </Button>
        </div>

        <p className="text-muted-foreground">
          Connect your account with third-party services to make your life easier and track from any
          place.
        </p>
      </header>

      <Suspense fallback={<Loader />}>
        <IntegrationsWrapperRSC slug={slug} />
      </Suspense>
    </Main>
  );
}
