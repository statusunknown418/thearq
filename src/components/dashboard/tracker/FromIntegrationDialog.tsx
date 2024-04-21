"use client";
import { type Issue } from "@linear/sdk";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  PiArrowRight,
  PiArrowsClockwise,
  PiArrowsLeftRight,
  PiCube,
  PiCubeDuotone,
  PiGithubLogo,
  PiGithubLogoDuotone,
  PiLink,
} from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { KBD } from "~/components/ui/kbd";
import { Label } from "~/components/ui/label";
import { Loader } from "~/components/ui/loader";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { type GithubQueryType, type Integration } from "~/lib/constants";
import { routes } from "~/lib/navigation";
import { useCommandsStore } from "~/lib/stores/commands-store";
import { useIntegrationDialogStore } from "~/lib/stores/sheets-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { cn } from "~/lib/utils";
import { type NewTimeEntry } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const FromIntegrationDialog = () => {
  const opened = useIntegrationDialogStore((s) => s.open);
  const setOpened = useIntegrationDialogStore((s) => s.setOpen);

  const form = useFormContext<NewTimeEntry>();

  const [search, setSearch] = useState<string>("");
  const deferredSearch = useDeferredValue(search);
  const closeModals = useCommandsStore((s) => s.clear);
  const workspace = useWorkspaceStore((s) => s.active);

  const [queryType, setQueryType] = useState<GithubQueryType | undefined>();

  const { data } = api.viewer.getIntegrations.useQuery(undefined, {
    initialData: [],
  });

  const selectedProvider = form.watch("integrationProvider") as Integration;

  const {
    data: githubIssues,
    error: githubError,
    isLoading: githubLoading,
  } = api.viewer.getGithubIssues.useQuery(
    {
      queryType,
      searchString: deferredSearch,
    },
    {
      enabled: selectedProvider === "github",
      retry: 1,
      refetchOnMount: false,
    },
  );

  const {
    data: linearIssues,
    error: linearError,
    isLoading: linearLoading,
  } = api.viewer.getLinearIssues.useQuery(
    {
      searchString: deferredSearch,
    },
    {
      enabled: selectedProvider === "linear",
      retry: 1,
      refetchOnMount: false,
    },
  );

  if (githubError ?? linearError) {
    toast.error("Failed to get data", {
      description: linearError?.message ?? githubError?.message,
    });
  }

  const handleSelectProvider = (provider: string) => {
    form.setValue("integrationProvider", provider);
  };

  const handleClearSelection = () => {
    form.setValue("integrationProvider", null);
    form.setValue("integrationUrl", null);
  };

  const handleSelectLink = (url: string) => {
    form.setValue("integrationUrl", url);
  };

  const hasIntegrationUrl = form.watch("integrationUrl");

  if (data.length === 0) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant={"secondary"} size={"sm"}>
            <PiLink size={16} />
            Link from integration
          </Button>
        </SheetTrigger>

        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Link from integrations</SheetTitle>
            <SheetDescription>
              Automatically link tasks from any of your integrations
            </SheetDescription>
          </SheetHeader>

          <div className="group mt-2 flex h-full flex-col items-center justify-center gap-2 rounded-xl border bg-secondary p-5 text-center text-muted-foreground">
            <PiCubeDuotone size={24} className="group-hover:animate-bounce" />

            <p>
              You don&apos;t have any active integrations. Please{" "}
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                  closeModals();
                }}
                href={routes.integrations({ slug: workspace?.slug ?? "./settings/integrations" })}
                className="text-indigo-500 transition-all hover:underline"
              >
                connect one
              </Link>{" "}
              to get started.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="flex gap-2">
      <Sheet open={opened} onOpenChange={setOpened}>
        <SheetTrigger asChild>
          <Button variant={"secondary"} className="group w-max" size={"sm"} type="button">
            {hasIntegrationUrl ? (
              <PiArrowsClockwise
                size={16}
                className="transition-transform group-hover:rotate-180"
              />
            ) : (
              <PiLink size={16} />
            )}
            {hasIntegrationUrl ? "Change link" : "Link from integration"}
          </Button>
        </SheetTrigger>

        <SheetContent className="flex flex-col gap-4 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Link from integrations</SheetTitle>
            <SheetDescription>
              Automatically link tasks from any of your integrations
            </SheetDescription>
          </SheetHeader>

          <section className="flex gap-2">
            <Select onValueChange={handleSelectProvider} value={selectedProvider ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select an integration" />
              </SelectTrigger>

              <SelectContent>
                {data.map((integration) => (
                  <SelectItem key={integration.providerAccountId} value={integration.provider}>
                    <div className="flex items-center gap-2">
                      {integration.provider === "github" && <PiGithubLogo size={16} />}
                      {integration.provider === "linear" && (
                        <Image src={"/linear-black.svg"} alt="linear icon" width={16} height={16} />
                      )}

                      <span className="capitalize">{integration.provider}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProvider === "github" && (
              <Select
                onValueChange={(v) => setQueryType(v as GithubQueryType)}
                defaultValue="is:issue"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="is:issue">Issues</SelectItem>
                  <SelectItem value="is:pull-request">Pull requests</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(!!hasIntegrationUrl || !!selectedProvider) && (
              <Button variant="secondary" className="h-full" onClick={handleClearSelection}>
                Clear
              </Button>
            )}
          </section>

          <div>
            {selectedProvider && (
              <Input
                placeholder="Search by title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </div>

          {!!hasIntegrationUrl && (
            <div className="text-ellipsis rounded-md border bg-secondary p-2">
              <Link
                href={hasIntegrationUrl}
                target="_blank"
                className="max-w-[20ch] text-xs font-medium"
              >
                Selected:{" "}
                <span className="text-indigo-600 dark:text-indigo-500">{hasIntegrationUrl}</span>
              </Link>
            </div>
          )}

          {selectedProvider === "github" && githubIssues?.length === 0 && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border bg-secondary text-muted-foreground">
              <PiCube size={24} />

              <p>No github issues found</p>
            </div>
          )}

          {selectedProvider === "linear" && linearIssues?.length === 0 && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border bg-secondary text-muted-foreground">
              <PiCube size={24} />

              <p>No linear issues found</p>
            </div>
          )}

          {selectedProvider === "linear" && linearLoading && !linearIssues && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border text-muted-foreground">
              <Loader />
            </div>
          )}

          {selectedProvider === "github" && githubLoading && !githubIssues && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border text-muted-foreground">
              <Loader />
            </div>
          )}

          <div className="overflow-y-scroll">
            <RadioGroup onValueChange={handleSelectLink} value={hasIntegrationUrl ?? ""}>
              {selectedProvider === "github" &&
                githubIssues?.map((issue) => <GithubIssue key={issue.id} issue={issue} />)}

              {selectedProvider === "linear" &&
                linearIssues?.map((issue) => <LinearIssue key={issue.id} issue={issue} />)}
            </RadioGroup>
          </div>
        </SheetContent>
      </Sheet>

      {selectedProvider === "github" && !!hasIntegrationUrl && (
        <div className="flex items-center gap-2">
          <PiArrowsLeftRight size={16} />

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant={"primary"} size={"sm"} className="w-max">
                  <Link href={hasIntegrationUrl} target="_blank">
                    <PiGithubLogoDuotone size={16} />
                    {githubIssues?.find((issue) => issue.html_url === hasIntegrationUrl)?.title}
                  </Link>
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                Links to
                <PiArrowRight />
                <span className="text-indigo-500">{hasIntegrationUrl}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {selectedProvider === "linear" && !!hasIntegrationUrl && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant={"link"}
                size={"sm"}
                className="w-max justify-start border border-indigo-500"
              >
                <Link href={hasIntegrationUrl} target="_blank">
                  <Image src={"/linear-black.svg"} width={16} height={16} alt="linear-logo" />
                  {linearIssues?.find((issue) => issue.url === hasIntegrationUrl)?.identifier}
                </Link>
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              Links to
              <PiArrowRight />
              <span className="text-indigo-500">{hasIntegrationUrl}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

const LinearIssue = ({ issue }: { issue: Issue }) => {
  const form = useFormContext<NewTimeEntry>();
  const url = form.watch("integrationUrl");

  const closeOuter = useIntegrationDialogStore((s) => s.setOpen);

  return (
    <Label
      onClick={() => closeOuter(false)}
      htmlFor={issue.url}
      className={cn(
        "group flex items-center gap-2 rounded-md border p-2.5 hover:bg-secondary",
        url === issue.url && "border-indigo-500 bg-indigo-50 hover:bg-indigo-50",
      )}
    >
      <RadioGroupItem id={issue.url} value={issue.url} />

      <KBD>{issue.identifier}</KBD>

      <PiArrowRight />

      <Link
        href={issue.url}
        target="_blank"
        className="max-w-[30ch] items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-indigo-600 dark:text-indigo-500"
      >
        {issue.title}
      </Link>
    </Label>
  );
};

/**
 * @description Note that the URL is actually called `html_url` in the Github API response
 * @returns
 */
const GithubIssue = ({ issue }: { issue: RouterOutputs["viewer"]["getGithubIssues"][number] }) => {
  const form = useFormContext<NewTimeEntry>();
  const url = form.watch("integrationUrl");

  const closeOuter = useIntegrationDialogStore((s) => s.setOpen);

  return (
    <Label
      onClick={() => closeOuter(false)}
      htmlFor={issue.url}
      className={cn(
        "group flex items-center gap-2 rounded-md border p-2.5 hover:bg-secondary",
        url === issue.html_url && "border-indigo-500 bg-indigo-50 hover:bg-indigo-50",
      )}
    >
      <RadioGroupItem id={issue.url} value={issue.html_url} />

      <KBD>#{issue.number}</KBD>

      <PiArrowRight />

      <Link
        href={issue.url}
        target="_blank"
        className="max-w-[30ch] items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-indigo-600 dark:text-indigo-500"
      >
        {issue.title}
      </Link>
    </Label>
  );
};
