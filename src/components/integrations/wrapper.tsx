import { PiLinkBreakDuotone } from "react-icons/pi";
import { api } from "~/trpc/server";
import { IntegrationsList } from "./IntegrationsList";

export const IntegrationsWrapperRSC = async ({ slug }: { slug: string }) => {
  const data = await api.viewer.getAvailableIntegrations.query();

  if (data.length === 0) {
    return <IntegrationsEmptyState />;
  }

  return <IntegrationsList initialData={data} slug={slug} />;
};

export const IntegrationsEmptyState = () => {
  return (
    <section className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border bg-muted p-4">
      <div className="flex items-center gap-2">
        <PiLinkBreakDuotone className="text-destructive" size={24} />

        <h2 className="text-xl font-medium">No integrations found</h2>
      </div>
      <p className="text-muted-foreground">Connect an integration to get started</p>
    </section>
  );
};
