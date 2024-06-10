import { Skeleton } from "../../ui/skeleton";
import { Overview } from "./Overview";

export const OverviewWrapperRSC = async () => {
  return <Overview />;
};

export const OverviewLoading = () => {
  return <Skeleton className="aspect-square h-40" />;
};
