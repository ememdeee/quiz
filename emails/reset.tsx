import { Heading, Section, Text } from "@react-email/components";
import { EmailButton, EmailLayout, LinkFallback, text } from "./layout";

export type ResetProps = { resetUrl: string };

/** "Reset your password" (board EmailReset). The link works for 1 hour. */
export function Reset({ resetUrl }: ResetProps) {
  return (
    <EmailLayout preview="Choose a new password for your Quiz account.">
      <Heading as="h1" style={text.title}>
        Reset your password
      </Heading>
      <Text style={text.paragraph}>We got a request to reset the password for your account. Click the button below to choose a new one.</Text>
      <Section style={{ margin: "28px 0" }}>
        <EmailButton href={resetUrl}>Choose a new password</EmailButton>
      </Section>
      <LinkFallback validFor="1 hour" href={resetUrl} />
      <Text style={text.rule}>Didn’t ask for this? You can ignore this email. Your password stays the same.</Text>
    </EmailLayout>
  );
}
