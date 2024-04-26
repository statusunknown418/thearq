import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/server";
import { StartLiveEntry } from "./StartLiveEntry";

export const LiveEntryWrapperLoading = () => {
  return <Loader />;
};

export const LiveEntryWrapperRSC = async () => {
  const initialData = await api.entries.getLiveEntry.query();

  if (!initialData) {
    return <StartLiveEntry initialData={null} />;
  }

  return <StartLiveEntry initialData={initialData} />;
};
