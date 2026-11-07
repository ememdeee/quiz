import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerifyEmailView } from "@/components/auth/verify-email-view";
import { auth } from "@/content/auth";
import { getPendingEmail } from "@/server/session";

export const metadata: Metadata = { title: "Check your email · Quiz", robots: { index: false } };

/** ?state=resent opens the "we sent it again" screen directly. */
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const email = (await getPendingEmail()) ?? auth.placeholderEmail;
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "mail", caption: auth.verify.caption }}>
      <VerifyEmailView email={email} initialResent={state === "resent"} />
    </AuthLayout>
  );
}
