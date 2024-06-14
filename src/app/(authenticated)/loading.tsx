import { Loader } from "~/components/ui/loader";

export default function AppLoader() {
  return (
    <section className="grid h-screen grid-cols-1 place-items-center justify-center p-8">
      <Loader />
      <p className="text-muted-foreground">Main app incoming!</p>
    </section>
  );
}
