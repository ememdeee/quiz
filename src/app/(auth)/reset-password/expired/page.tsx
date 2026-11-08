import type { Metadata } from "next";
import { BackToLogin } from "@/components/auth/back-link";
import { AuthHeading, AuthLayout, AuthStack } from "@/components/auth/auth-layout";
import { ButtonLink } from "@/components/ui/button";
import { auth } from "@/content/auth";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "This link has expired · Quiz", robots: { index: false } };

export default function ResetPasswordExpiredPage() {
  const page = auth.resetExpired;
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "clock", caption: page.caption }}>
      <AuthStack>
        <AuthHeading title={page.title} sub={page.sub} />
        <ButtonLink href={routes.forgotPassword} size="lg" block>
          {page.button}
        </ButtonLink>
        <BackToLogin />
      </AuthStack>
    </AuthLayout>
  );
}
