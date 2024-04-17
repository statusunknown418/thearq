import { cookies } from "next/headers";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import { RECENT_W_ID_KEY } from "~/lib/constants";
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
  const workspaceId = cookies().get(RECENT_W_ID_KEY)?.value;

  if (!workspaceId) {
    return <div>You must select a workspace first</div>;
  }

  const w = await api.workspaces.getBySlug.query({ slug, id: Number(workspaceId) });

  return <InviteTeam workspace={w} workspaceId={Number(workspaceId)} />;
};
