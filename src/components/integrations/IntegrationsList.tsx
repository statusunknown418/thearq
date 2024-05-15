"use client";

import Image from "next/image";
import { PiGithubLogoDuotone } from "react-icons/pi";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { Switch } from "../ui/switch";

export const IntegrationsList = ({
  initialData,
}: {
  initialData: RouterOutputs["viewer"]["getAvailableIntegrations"];
  slug: string;
}) => {
  const utils = api.useUtils();

  const { data } = api.viewer.getAvailableIntegrations.useQuery(undefined, {
    initialData,
  });

  const disconnect = api.integrations.disconnect.useMutation({
    onSuccess: async () => {
      toast.success("Integration disconnected");
      return Promise.all([
        utils.viewer.getAvailableIntegrations.invalidate(),
        utils.viewer.getIntegrations.invalidate(),
      ]);
    },
  });

  const reconnect = api.integrations.reconnect.useMutation({
    onSuccess: async () => {
      toast.success("Integration reconnected");
      return Promise.all([
        utils.viewer.getAvailableIntegrations.invalidate(),
        utils.viewer.getIntegrations.invalidate(),
      ]);
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
    <div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.map((integration) => (
          <li
            className="flex flex-col gap-4 rounded-xl border bg-secondary-background p-4 shadow"
            key={integration.providerAccountId}
          >
            <section className="flex flex-col gap-4 rounded-xl ">
              <div className="flex items-center gap-4 rounded-full">
                <p
                  className={cn(integration.enabled ? "text-indigo-400" : "text-muted-foreground")}
                >
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

              <header className="flex w-full items-center gap-3">
                {integration.provider === "github" ? (
                  <PiGithubLogoDuotone size={24} />
                ) : (
                  <Image src={"/linear-black.svg"} alt="linear icon" width={24} height={24} />
                )}

                <h2 className="text-xl font-medium capitalize">{integration.provider}</h2>
              </header>

              <p className="text-muted-foreground">
                {integration.provider === "github" &&
                  "Links your opened issues and pull requests to your account"}
                {integration.provider === "linear" &&
                  "Links assigned linear issues to your account"}
              </p>

              <p className="text-muted-foreground">You can disconnect at anytime.</p>
            </section>
          </li>
        ))}
      </ul>
    </div>
  );
};
