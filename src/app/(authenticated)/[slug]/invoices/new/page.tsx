import Link from "next/link";
import { type SearchParams } from "nuqs/parsers";
import { PiArrowLeft } from "react-icons/pi";
import { InvoiceForm } from "~/components/invoices/InvoiceForm";
import { invoiceParamsCache } from "~/components/invoices/invoices-cache";
import { Main } from "~/components/layout/Main";
import { PageHeader } from "~/components/layout/PageHeader";
import { Button } from "~/components/ui/button";
import { StackTooltip } from "~/components/ui/tooltip";

export default function NewInvoicePage({ searchParams }: { searchParams: SearchParams }) {
  invoiceParamsCache.parse(searchParams);

  return (
    <Main>
      <PageHeader>
        <StackTooltip side="bottom" align="start" content={<div>Go back</div>}>
          <Button size={"icon"} subSize={"iconLg"} variant={"secondary"} asChild>
            <Link href={"../invoices"}>
              <PiArrowLeft size={16} />
            </Link>
          </Button>
        </StackTooltip>

        <article className="flex gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold">New invoice</h1>

            <p className="text-muted-foreground">
              Select a client, which projects to include and fully customize this invoice.
            </p>
          </div>
        </article>
      </PageHeader>

      <InvoiceForm />
    </Main>
  );
}
