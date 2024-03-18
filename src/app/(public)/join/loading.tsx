import { Loader } from "~/components/ui/loader";

export default function Loading() {
  return (
    <div className="grid h-full grid-cols-1 place-items-center">
      <Loader lg />
    </div>
  );
}
