import { Heading, Link, Section, Text } from "@react-email/components";
import { CONTACT_EMAIL, mailto } from "@/lib/routes";
import { colors, EmailButton, EmailLayout, text } from "./layout";

export type PasswordChangedProps = {
  /** The day it happened, already written out: "November 6, 2026" */
  changedOn: string;
  /** Where "Reset my password" goes (the Forgot password page, as a whole address) */
  resetUrl: string;
};

/** "Your password was changed" (board EmailPasswordChanged). Sent after a change or a completed reset. */
export function PasswordChanged({ changedOn, resetUrl }: PasswordChangedProps) {
  return (
    <EmailLayout preview="The password for your Quiz account was changed.">
      <Heading as="h1" style={text.title}>
        Your password was changed
      </Heading>
      <Text style={text.paragraph}>The password for your Quiz account was changed on {changedOn}. You were signed out on all devices.</Text>
      <Text style={{ ...text.paragraph, margin: "18px 0 0" }}>
        <strong>Was this you?</strong> Then there is nothing more to do.
      </Text>
      <Text style={{ ...text.paragraph, margin: "10px 0 0" }}>
        <strong>Wasn’t you?</strong> Reset your password right away.
      </Text>
      <Section style={{ margin: "24px 0" }}>
        <EmailButton href={resetUrl}>Reset my password</EmailButton>
      </Section>
      <Text style={{ ...text.small, paddingTop: 20, borderTop: `1px solid ${colors.line}` }}>
        Need help? Reply to this email or write to{" "}
        <Link href={mailto()} style={{ color: colors.mute }}>
          {CONTACT_EMAIL}
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
