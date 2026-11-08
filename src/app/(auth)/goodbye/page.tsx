import type { Metadata } from "next";
import { AuthHeading, AuthLayout, AuthStack } from "@/components/auth/auth-layout";
import { ButtonLink } from "@/components/ui/button";
import { auth } from "@/content/auth";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Your account was deleted · Quiz", robots: { index: false } };

export default function GoodbyePage() {
  const page = auth.goodbye;
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "check", caption: page.caption }}>
      <AuthStack>
        <AuthHeading title={page.title} sub={page.sub} />
        <ButtonLink href={routes.home} size="lg" block>
          {page.button}
        </ButtonLink>
      </AuthStack>
    </AuthLayout>
  );
}
