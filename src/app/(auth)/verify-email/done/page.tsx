import type { Metadata } from "next";
import { AuthHeading, AuthLayout, AuthStack } from "@/components/auth/auth-layout";
import { ButtonLink } from "@/components/ui/button";
import { auth } from "@/content/auth";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Email verified · Quiz", robots: { index: false } };

export default function VerifyEmailDonePage() {
  const page = auth.verifyDone;
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "check", caption: page.caption }}>
      <AuthStack>
        <AuthHeading title={page.title} sub={page.sub} />
        <ButtonLink href={routes.dashboard} size="lg" block>
          {page.button}
        </ButtonLink>
      </AuthStack>
    </AuthLayout>
  );
}
