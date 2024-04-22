import Image from "next/image";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { auth } from "~/server/auth";

export default async function AccountSettingsPage() {
  const session = await auth();

  return (
    <Main>
      <PageHeader>
        <section className="flex flex-grow gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-bold">My account</h1>

            <p className="text-muted-foreground">
              Manage your personal settings, like your email, picture and notifications.
            </p>
          </div>
        </section>
      </PageHeader>

      <section className="flex max-w-xl flex-col rounded-lg border">
        <div className="flex justify-center border-b bg-secondary p-8">
          {session?.user.image && (
            <Image
              src={session.user.image}
              alt="User image"
              width={100}
              height={100}
              className="rounded-lg"
            />
          )}
        </div>

        <section className="flex w-full flex-col gap-4 self-center py-2">
          <div className="flex w-full max-w-md items-center justify-between self-center py-2">
            <p className="text-muted-foreground">Name</p>

            <Input defaultValue={session?.user.name ?? ""} className="w-52" />
          </div>

          <Separator />

          <div className="flex w-full max-w-md items-center justify-between self-center py-2">
            <p className="text-muted-foreground">Email</p>

            <Input defaultValue={session?.user.email ?? ""} className="w-52" disabled />
          </div>
        </section>
      </section>
    </Main>
  );
}
