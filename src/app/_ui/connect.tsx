import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { type Integration } from "~/lib/constants";
import { buildConnectionURL } from "~/server/api/routers/integrations";

export const Connect = ({ to }: { to: Integration }) => {
  return (
    <Button asChild className="capitalize">
      <Link href={buildConnectionURL(to)}>
        {to === "github" && <GitHubLogoIcon />}
        {to === "linear" && (
          <Image src={"/linear-icon.svg"} alt="linear icon" width={15} height={15} />
        )}
        Link {to}
      </Link>
    </Button>
  );
};
