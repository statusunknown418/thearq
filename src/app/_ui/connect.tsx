import Link from "next/link";
import { type Integration } from "~/lib/constants";
import { buildConnectionURL } from "~/server/api/routers/integrations";

export const Connect = ({ to }: { to: Integration }) => {
  return (
    <Link href={buildConnectionURL(to)} className="btn btn-link">
      Connect to {to}
    </Link>
  );
};
