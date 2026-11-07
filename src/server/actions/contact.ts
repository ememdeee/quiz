"use server";

import { render } from "@react-email/components";
import { Contact } from "@emails";
import { contact } from "@/content/contact";
import { dataMode } from "@/lib/env";
import { CONTACT_EMAIL } from "@/lib/routes";
import { isValidEmail } from "@/lib/validation";
import { ipHash } from "@/server/auth/lockout";
import { turnstilePassed } from "@/server/auth/turnstile";
import { sendEmail } from "@/server/email/send";
import { createAdminClient } from "@/server/supabase/admin";

export type ContactFormState =
  | { status: "idle" }
  | { status: "sent" }
  | {
      status: "error";
      values: { name: string; email: string; message: string; topics: string[] };
      errors: { email?: string; message?: string };
    };

/**
 * The contact form. It checks the form, saves a copy of the message (so it is never lost if the email fails), limits how many a
 * person can send, and emails the owner with the visitor as reply-to. In mock mode it only pretends (handover 8.12).
 */
export async function sendContactMessage(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = {
    name: String(formData.get("name") ?? "").slice(0, 200),
    email: String(formData.get("email") ?? "").trim().slice(0, 200),
    message: String(formData.get("message") ?? "").slice(0, 5000),
    topics: formData.getAll("topic").map((topic) => String(topic).slice(0, 80)).slice(0, 10),
  };

  const errors: { email?: string; message?: string } = {};
  if (!isValidEmail(values.email)) errors.email = contact.errors.email;
  if (values.message.trim().length === 0) errors.message = contact.errors.message;
  if (errors.email || errors.message) return { status: "error", values, errors };

  if (dataMode !== "supabase") {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { status: "sent" };
  }

  // A failed bot check says the message was not sent (a real person whose check did not load must not lose their message; gap G25)
  if (!(await turnstilePassed(formData))) return { status: "error", values, errors: {} };
  const db = createAdminClient();
  const hash = await ipHash();
  const { data: allowed } = await db.rpc("rate_limit_hit", { p_key: `contact:${hash}`, p_limit: 5, p_window_seconds: 3600 });
  // Too many from one person: look as if it worked, send nothing
  if (allowed === false) return { status: "sent" };

  const topic = values.topics.join(", ") || "Other";
  const { data: saved, error } = await db.from("contact_messages").insert({ name: values.name || "(no name)", email: values.email, topic, message: values.message, ip_hash: hash }).select("id").single();
  if (error || !saved) return { status: "error", values, errors: {} };

  const html = await render(Contact({ name: values.name || values.email, email: values.email, needs: values.topics, message: values.message }));
  const sent = await sendEmail({ to: CONTACT_EMAIL, subject: "New message from the Quiz contact form", html, replyTo: values.email });
  if (sent.ok) await db.from("contact_messages").update({ email_sent: true }).eq("id", saved.id);
  // The message is saved either way, so the visitor is told it was sent
  return { status: "sent" };
}
