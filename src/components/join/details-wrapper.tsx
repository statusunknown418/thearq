import Image from "next/image";
import { APP_URL } from "~/lib/constants";
import { routes } from "~/lib/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { SignIn } from "../common/SignIn";
import { AcceptInvite } from "./AcceptInvite";

export const InvitationDetailsWrapperRSC = async ({ params }: { params: unknown }) => {
  const {
    workspace: [workspace, invitation],
  } = routes.join.$parseParams(params);

  const session = await auth();

  // Meh way to get the current full URL
  const details = await api.workspaces.getInvitationDetails.query({
    link: `${APP_URL}/join/${workspace}/${invitation}`,
  });

  if (details.error) {
    return (
      <div>
        <h1 className="text-xl">Something happened</h1>

        <p>{details.error}</p>
      </div>
    );
  }

  return (
    details.data && (
      <section className="grid grid-cols-1 place-items-center gap-6 rounded-xl border bg-secondary p-10">
        <Image
          src={details.data?.image}
          alt={details.data?.name}
          width={64}
          height={64}
          className="rounded-lg"
        />

        <h1 className="text-2xl font-semibold">Join {details.data?.name}</h1>
        <p className="text-center text-muted-foreground">
          You have been invited to join {details.data?.name}. You will be able to join the workspace
          and collaborate with your team.
        </p>

        {session?.user ? (
          <AcceptInvite userEmail={session.user.email ?? ""} slug={workspace ?? ""} />
        ) : (
          <SignIn />
        )}
      </section>
    )
  );
};
