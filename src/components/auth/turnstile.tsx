"use client";

import Script from "next/script";
import { publicEnv } from "@/lib/env";

/** The Cloudflare Turnstile bot check. It adds its own hidden answer to the form it sits in. Nothing shows when no key is set. */
export function TurnstileWidget() {
  if (!publicEnv.turnstileSiteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="cf-turnstile" data-sitekey={publicEnv.turnstileSiteKey} data-theme="light" />
    </>
  );
}
