import type { Metadata } from "next";
import { BackToLogin } from "@/components/auth/back-link";
import { AuthHeading, AuthLayout, AuthStack } from "@/components/auth/auth-layout";
import { ButtonLink } from "@/components/ui/button";
import { auth } from "@/content/auth";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "This link has expired · Quiz", robots: { index: false } };

/** The verify link ran out. With `?for=email-change` it is the link in "Confirm your new email" (no board, gap G5). */
export default async function VerifyEmailExpiredPage({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: kind } = await searchParams;
  const emailChange = kind === "email-change";
  const page = emailChange ? auth.emailChangeExpired : auth.verifyExpired;
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "clock", caption: page.caption }}>
      <AuthStack>
        <AuthHeading title={page.title} sub={page.sub} />
        <ButtonLink href={emailChange ? routes.account : routes.verifyEmail} size="lg" block>
          {page.button}
        </ButtonLink>
        <BackToLogin />
      </AuthStack>
    </AuthLayout>
  );
}
