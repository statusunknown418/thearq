import Link from "next/link";
import { PiPaperclip } from "react-icons/pi";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { KBD } from "~/components/ui/kbd";
import { StackTooltip } from "~/components/ui/tooltip";

export default function InvoicesPage() {
  return (
    <Main>
      <PageHeader>
        <StackTooltip
          side="bottom"
          align="start"
          content={
            <div>
              Create a new invoice <KBD>Shift</KBD> + <KBD>I</KBD> + <KBD>N</KBD>
            </div>
          }
        >
          <Button size={"icon"} subSize={"iconLg"} asChild>
            <Link href={"./invoices/new"}>
              <PiPaperclip size={20} />
            </Link>
          </Button>
        </StackTooltip>

        <article className="flex gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold">Invoices</h1>

            <p className="text-muted-foreground">
              This is a general overview of all the invoices that belong to this workspace.
            </p>
          </div>
        </article>
      </PageHeader>
    </Main>
  );
}
