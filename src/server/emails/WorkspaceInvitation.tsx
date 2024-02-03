import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface VercelInviteUserEmailProps {
  invitedByUsername?: string;
  invitedByEmail?: string;
  workspaceSlug?: string;
  teamImage?: string;
  inviteLink?: string;
  userEmail?: string;
}

export const VercelInviteUserEmail = ({
  invitedByUsername,
  invitedByEmail,
  workspaceSlug,
  teamImage,
  inviteLink,
  userEmail,
}: VercelInviteUserEmailProps) => {
  const previewText = `Join the ${invitedByUsername} workspace`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={"https://picsum.photos/40"}
                width="40"
                height="37"
                alt="Vercel"
                className="mx-auto my-0 rounded-lg"
              />
            </Section>

            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Join the <strong>{workspaceSlug}</strong> workspace
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">Hey 👋,</Text>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{invitedByUsername}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {invitedByEmail}
              </Link>
              ) has invited you to the <strong>{workspaceSlug}</strong> workspace.
            </Text>

            <Container className="rounded-lg border border-solid border-[#e4e4e7] bg-[#fafafa] py-[32px]">
              <Section>
                <Row>
                  <Column align="center">
                    <Img
                      className="rounded-full"
                      src={teamImage}
                      width="64"
                      height="64"
                    />

                    <Text className="text-[16px] font-bold text-black">
                      {workspaceSlug}
                    </Text>

                    <Button
                      className="rounded-full bg-[#6366f1] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                      href={inviteLink}
                    >
                      Join the team
                    </Button>
                  </Column>
                </Row>
              </Section>
            </Container>

            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{" "}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              This invitation was intended for{" "}
              <span className="text-black">{userEmail}</span>. If you were not expecting
              this invitation, you can ignore this email. If you are concerned about your
              account&apos;s safety, please reply to this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VercelInviteUserEmail.PreviewProps = {
  username: "status.unknown",
  userImage: `https://fastly.picsum.photos/id/635/200/200.jpg?hmac=Vm8Tavc31Qax01634w3MOPpNCCfasJG8wnBamSi87T4`,
  invitedByUsername: "Alan",
  invitedByEmail: "alan.turing@example.com",
  workspaceSlug: "Enigma",
  teamImage: `https://fastly.picsum.photos/id/635/200/200.jpg?hmac=Vm8Tavc31Qax01634w3MOPpNCCfasJG8wnBamSi87T4`,
  inviteLink: "https://vercel.com/teams/invite/foo",
} as VercelInviteUserEmailProps;

export default VercelInviteUserEmail;
