import { type RouterOutputs } from "~/trpc/shared";
import { mergeTRPCRouters } from "../../trpc";
import { entriesAccumulatesRouter } from "./accumulates";
import { baseEntriesRouter } from "./base";
import { entriesInvoicingRouter } from "./invoicing";

export type CustomEvent = RouterOutputs["entries"]["getByMonth"][number] & {
  temp?: boolean;
};

export const entriesRouter = mergeTRPCRouters(
  baseEntriesRouter,
  entriesInvoicingRouter,
  entriesAccumulatesRouter,
);
