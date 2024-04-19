"use client";

import Image from "next/image";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { Switch } from "../ui/switch";

export const IntegrationsList = ({
  initialData,
}: {
  initialData: RouterOutputs["viewer"]["getIntegrations"];
  slug: string;
}) => {
  const utils = api.useUtils();

  const { data } = api.viewer.getIntegrations.useQuery(undefined, {
    initialData,
  });

  const disconnect = api.integrations.disconnect.useMutation({
    onSuccess: async () => {
      toast.success("Integration disconnected");
      return utils.viewer.getIntegrations.invalidate();
    },
  });

  const reconnect = api.integrations.reconnect.useMutation({
    onSuccess: async () => {
      toast.success("Integration reconnected");
      return utils.viewer.getIntegrations.invalidate();
    },
  });

  const handleReconnect = async (provider: string) => {
    toast.promise(reconnect.mutateAsync({ provider }), {
      loading: "Reconnecting",
      success: "Integration reconnected",
      error: "Failed to reconnect",
    });
  };

  const handleDisconnect = async (provider: string) => {
    toast.promise(disconnect.mutateAsync({ provider }), {
      loading: "Disconnecting",
      success: "Integration disconnected",
      error: "Failed to disconnect",
    });
  };

  return (
    <ul className="grid grid-cols-1 gap-4">
      {data.map((integration) => (
        <li
          className="flex flex-col gap-4 rounded-xl bg-muted p-1 pt-4"
          key={integration.providerAccountId}
        >
          <div className="flex items-center gap-4 rounded-full px-4">
            <p className={cn(integration.enabled ? "text-indigo-400" : "text-muted-foreground")}>
              {integration.enabled ? "Enabled" : "Disabled"}
            </p>

            <Switch
              disabled={reconnect.isLoading || disconnect.isLoading}
              checked={integration.enabled}
              onCheckedChange={async (v) => {
                if (!!v) {
                  await handleReconnect(integration.provider);
                } else {
                  await handleDisconnect(integration.provider);
                }
              }}
            />
          </div>

          <section className="flex flex-col gap-4 rounded-xl bg-background p-8 shadow">
            <header className="flex w-full items-center gap-3">
              <Image src={"/linear-icon.svg"} alt="linear icon" width={24} height={24} />

              <h2 className="text-xl font-medium capitalize">{integration.provider}</h2>
            </header>

            <p className="text-muted-foreground">
              All connected {integration.provider} account data will be synced to this workspace and
              each teammate will have its tasks auto assigned to them based on the integration
              settings.
            </p>

            <p className="text-muted-foreground">You can disconnect at anytime.</p>
          </section>
        </li>
      ))}
    </ul>
  );
};
