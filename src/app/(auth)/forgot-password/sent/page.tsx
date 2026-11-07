import type { Metadata } from "next";
import { AuthHeading, AuthLayout, authLink, AuthStack } from "@/components/auth/auth-layout";
import { ButtonLink } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { auth } from "@/content/auth";
import { routes } from "@/lib/routes";
import { getPendingEmail } from "@/server/session";

export const metadata: Metadata = { title: "Check your email · Quiz", robots: { index: false } };

export default async function ForgotPasswordSentPage() {
  const email = (await getPendingEmail()) ?? auth.placeholderEmail;
  const { forgotSent } = auth;
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "mail", caption: forgotSent.caption }}>
      <AuthStack>
        <AuthHeading title={forgotSent.title} sub={<RichText text={forgotSent.sub.replace("{email}", email)} />} />
        <ButtonLink href={routes.login} size="lg" block>
          {forgotSent.back}
        </ButtonLink>
        <p className="m-0 text-base text-ink-2">
          <RichText text={forgotSent.again} linkClassName={authLink} />
        </p>
      </AuthStack>
    </AuthLayout>
  );
}
