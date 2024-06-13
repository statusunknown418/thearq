import { mergeTRPCRouters } from "../../trpc";
import { entriesAccumulatesRouter } from "./accumulates";
import { baseEntriesRouter } from "./base";
import { entriesInvoicingRouter } from "./invoicing";

export const entriesRouter = mergeTRPCRouters(
  baseEntriesRouter,
  entriesInvoicingRouter,
  entriesAccumulatesRouter,
);
