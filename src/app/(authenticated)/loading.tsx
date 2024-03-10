import { Loader } from "~/components/ui/loader";

export default function AppLoader() {
  return (
    <section className="grid h-screen place-items-center justify-center">
      <Loader />
    </section>
  );
}
