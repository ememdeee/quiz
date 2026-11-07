"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/banner";
import { Button, ButtonLink, DisabledButton } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { auth, RESEND_WAIT_SECONDS } from "@/content/auth";
import { routes } from "@/lib/routes";
import { resendVerificationAction } from "@/server/actions/auth";
import { AuthHeading, authLink, AuthStack } from "./auth-layout";

/** "Check your email" after sign-up, with the 60 second wait before asking for another email. */
export function VerifyEmailView({ email, initialResent }: { email: string; initialResent: boolean }) {
  const { verify } = auth;
  const [resent, setResent] = useState(initialResent);
  const [seconds, setSeconds] = useState(initialResent ? RESEND_WAIT_SECONDS : 0);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const sendAgain = async () => {
    setSeconds(RESEND_WAIT_SECONDS);
    setResent((await resendVerificationAction()).ok);
  };

  return (
    <AuthStack>
      <AuthHeading title={verify.title} sub={<RichText text={verify.sub.replace("{email}", email)} />} />
      {resent ? (
        <Banner tone="info">
          <RichText text={verify.resentBanner} />
        </Banner>
      ) : null}
      <ButtonLink href={routes.dashboard} size="lg" block>
        {verify.done}
      </ButtonLink>
      {seconds > 0 ? (
        <DisabledButton variant="secondary" size="lg" block>
          {verify.resendWait.replace("{seconds}", String(seconds))}
        </DisabledButton>
      ) : (
        <Button variant="secondary" size="lg" block onClick={sendAgain}>
          {verify.resend}
        </Button>
      )}
      <p className="m-0 text-base text-ink-2">
        <RichText text={resent ? verify.resentHelp : verify.wrongAddress} linkClassName={authLink} />
      </p>
    </AuthStack>
  );
}
