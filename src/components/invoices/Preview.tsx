"use client";
import { formatDate } from "date-fns";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { useAuthStore } from "~/lib/stores/auth-store";
import { useInvoicesStore } from "~/lib/stores/invoices-store";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import { type InvoiceSchema } from "~/server/db/edge-schema";

export const InvoicePreview = () => {
  const workspace = useWorkspaceStore((s) => s.active);
  const user = useAuthStore((s) => s.user);
  const storedInvoice = useInvoicesStore((s) => s.client);

  const formContext = useFormContext<InvoiceSchema>();
  const values = formContext.watch();

  return (
    <article className="flex flex-col rounded-t-lg border border-dashed bg-secondary-background">
      <section className="flex justify-around border-b p-4">
        <div className="text-xs">
          <p className="text-muted-foreground">Invoice ID</p>
          <h4>{values.identifier}</h4>
        </div>

        <div className="text-xs">
          <p className="text-muted-foreground">Issued at</p>
          <h4>{values.createdAt && formatDate(values.createdAt, "dd/MM/yyyy")}</h4>
        </div>

        <div className="text-xs">
          <p className="text-muted-foreground">Due date</p>
          <h4>{values.dueAt && formatDate(values.dueAt, "dd/MM/yyyy")}</h4>
        </div>
      </section>

      <section className="grid grid-cols-2 border-b">
        <article className="border-r p-4">
          <h4 className="text-xs font-medium text-muted-foreground">FROM</h4>

          {workspace?.image && (
            <Image
              src={workspace.image}
              height={32}
              width={32}
              className="mt-4 rounded-full object-cover"
              alt="company-logo"
            />
          )}

          <h4 className="mt-2">{workspace?.name}</h4>
          <p className="text-muted-foreground">{user?.email}</p>
        </article>

        <article className="p-4">
          <h4 className="text-xs font-medium text-muted-foreground">TO</h4>

          <h4>{storedInvoice?.name}</h4>
          <h4>{storedInvoice?.email}</h4>
          <h4>{storedInvoice?.address}</h4>
        </article>
      </section>
    </article>
  );
};
