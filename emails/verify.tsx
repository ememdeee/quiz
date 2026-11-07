import { Heading, Section, Text } from "@react-email/components";
import { EmailButton, EmailLayout, LinkFallback, text } from "./layout";

export type VerifyProps = { name: string; verifyUrl: string };

/** "Verify your email" (board EmailVerify). Sent when someone registers or asks for the link again. The link works for 1 hour (decision D1: Supabase has one lifetime for all its links; the board still says 24 hours). */
export function Verify({ name, verifyUrl }: VerifyProps) {
  return (
    <EmailLayout preview="Confirm your email address to start making quizzes.">
      <Heading as="h1" style={text.title}>
        Verify your email
      </Heading>
      <Text style={text.paragraph}>Hi {name}, thanks for signing up. Click the button below to confirm your email address and start making quizzes.</Text>
      <Section style={{ margin: "28px 0" }}>
        <EmailButton href={verifyUrl}>Verify my email</EmailButton>
      </Section>
      <LinkFallback validFor="1 hour" href={verifyUrl} />
      <Text style={text.rule}>If you didn’t create a Quiz account, you can ignore this email.</Text>
    </EmailLayout>
  );
}
