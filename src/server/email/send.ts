import "server-only";
import { emailEnv } from "@/lib/env";

export type OutgoingEmail = { to: string; subject: string; html: string; replyTo?: string };
export type SendResult = { ok: true; via: "resend" | "mailtrap" | "none" } | { ok: false; error: string };

const parse = (from: string) => {
  const match = /^(.*)<(.+)>$/.exec(from.trim());
  return match ? { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() } : { name: "Quiz", email: from.trim() };
};

/**
 * Sends one email. With a Resend key it goes out for real; without one, in development, it lands in the Mailtrap test
 * inbox (nothing reaches a real person); with neither, it is only skipped and says so. One function, so every email
 * of the product leaves the same way (handover 8.12).
 */
export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const env = emailEnv();

  if (env.resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.from, to: [email.to], subject: email.subject, html: email.html, ...(email.replyTo ? { reply_to: email.replyTo } : {}) }),
    });
    return response.ok ? { ok: true, via: "resend" } : { ok: false, error: `Resend answered ${response.status}` };
  }

  if (env.mailtrapToken && env.mailtrapInbox) {
    const sender = parse(env.from);
    const response = await fetch(`https://sandbox.api.mailtrap.io/api/send/${env.mailtrapInbox}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.mailtrapToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: sender,
        to: [{ email: email.to }],
        subject: email.subject,
        html: email.html,
        ...(email.replyTo ? { headers: { "Reply-To": email.replyTo } } : {}),
      }),
    });
    return response.ok ? { ok: true, via: "mailtrap" } : { ok: false, error: `Mailtrap answered ${response.status}` };
  }

  return { ok: true, via: "none" };
}
