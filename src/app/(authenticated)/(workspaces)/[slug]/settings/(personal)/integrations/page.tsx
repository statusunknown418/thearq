import { Suspense } from "react";
import { PiPlugDuotone } from "react-icons/pi";
import { IntegrationsWrapperRSC } from "~/components/integrations/wrapper";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { routes } from "~/lib/navigation";

export default function PersonalIntegrationsSettingsPage({ params }: { params: unknown }) {
  const { slug } = routes.integrations.$parseParams(params);

  return (
    <Main>
      <PageHeader className="items-start">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size={"icon"} subSize={"iconLg"}>
                <PiPlugDuotone size={24} />
              </Button>
            </TooltipTrigger>

            <TooltipContent>Add more integrations</TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
