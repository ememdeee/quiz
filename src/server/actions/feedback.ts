"use server";

import { render } from "@react-email/components";
import { Contact } from "@emails";
import { dataMode } from "@/lib/env";
import { fail, ok, type ActionResult } from "@/lib/errors";
import { FEEDBACK_MAX } from "@/lib/feedback";
import { CONTACT_EMAIL } from "@/lib/routes";
import { requireUser } from "@/server/auth/guards";
import { ipHash } from "@/server/auth/lockout";
import { sendEmail } from "@/server/email/send";
import { rateAllowed } from "@/server/rate-limit";
import { createAdminClient } from "@/server/supabase/admin";

/**
 * "Send feedback" from the account menu (gap G30, no board). Only logged-in people can send it, so the owner always knows who wrote.
 * It is kept in `contact_messages` (topic "Feedback") so it is never lost if the email fails, and emailed to the owner with the
 * person as reply-to. At most 5 an hour per person. In mock mode it only pretends.
 */
export async function sendFeedbackAction(message: string): Promise<ActionResult<true>> {
  const text = message.trim();
  if (!text) return fail("load_failed");
  if (text.length > FEEDBACK_MAX) return fail("too_large");
  const auth = await requireUser();
  if (!auth.ok) return auth;

  if (dataMode !== "supabase") {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return ok(true);
  }
  if (!(await rateAllowed(`feedback:${auth.data.userId}`, 5, 3600))) return fail("rate_limited");

  const { email, profile } = auth.data;
  const name = profile.name || email;
  const { data: saved, error } = await createAdminClient()
    .from("contact_messages")
    .insert({ name, email, topic: "Feedback", message: text, ip_hash: await ipHash() })
    .select("id")
    .single();
  if (error || !saved) return fail("load_failed");

  const html = await render(Contact({ name, email, needs: ["Feedback"], message: text }));
  const sent = await sendEmail({ to: CONTACT_EMAIL, subject: "New feedback from the Quiz app", html, replyTo: email });
  // The message is saved either way, so the person is told it was sent
  if (sent.ok) await createAdminClient().from("contact_messages").update({ email_sent: true }).eq("id", saved.id);
  return ok(true);
}
