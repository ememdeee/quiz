import { Heading, Section, Text } from "@react-email/components";
import { EmailButton, EmailLayout, LinkFallback, text } from "./layout";

export type NewAddressProps = { name: string; newEmail: string; confirmUrl: string };

/** "Confirm your new email" (board EmailNewAddress). Goes to the NEW address; the old one keeps working until the link is opened. */
export function NewAddress({ name, newEmail, confirmUrl }: NewAddressProps) {
  return (
    <EmailLayout preview="Confirm your new email address for Quiz.">
      <Heading as="h1" style={text.title}>
        Confirm your new email
      </Heading>
      <Text style={text.paragraph}>
        Hi {name}, you asked to change your Quiz email to <strong>{newEmail}</strong>. Click the button to confirm. Until then, you keep logging in with your old email.
      </Text>
      <Section style={{ margin: "28px 0" }}>
        <EmailButton href={confirmUrl}>Confirm new email</EmailButton>
      </Section>
      <LinkFallback validFor="24 hours" href={confirmUrl} />
      <Text style={text.rule}>If you didn’t ask for this, ignore this email. Your email stays the same.</Text>
    </EmailLayout>
  );
}
