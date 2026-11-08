import "server-only";
import { headers } from "next/headers";
import { optionalServerEnv, publicEnv } from "@/lib/env";

/** Checks the Cloudflare Turnstile answer a form sent. With no keys set the check is off and everyone passes (development, tests). */
export async function turnstilePassed(formData: FormData): Promise<boolean> {
  const { turnstileSecret } = optionalServerEnv();
  if (!turnstileSecret || !publicEnv.turnstileSiteKey) return true;
  const token = String(formData.get("cf-turnstile-response") ?? "");
  if (!token) return false;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: turnstileSecret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    return ((await response.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}
