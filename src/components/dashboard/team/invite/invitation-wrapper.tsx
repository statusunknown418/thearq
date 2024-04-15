import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/server";
import { InviteTeam } from "./InviteTeam";

export const InvitationLoading = () => {
  return (
    <Alert>
      <AlertTitle className="text-base">Invite teammates</AlertTitle>

      <AlertDescription>
        <Skeleton className="h-10 w-full" />
      </AlertDescription>
    </Alert>
  );
};

export const InvitationWrapperRSC = async ({ slug }: { slug: string }) => {
  const w = await api.workspaces.getBySlug.query({ slug });

  return <InviteTeam workspace={w} />;
};
