"use server";

import { contact } from "@/content/contact";
import { isValidEmail } from "@/lib/validation";

export type ContactFormState =
  | { status: "idle" }
  | { status: "sent" }
  | {
      status: "error";
      values: { name: string; email: string; message: string; topics: string[] };
      errors: { email?: string; message?: string };
    };

/**
 * Mock for the UI phase: checks the form and pretends to send it.
 * Phase 12 saves the message, rate limits it and emails it for real.
 */
export async function sendContactMessage(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    topics: formData.getAll("topic").map(String),
  };

  const errors: { email?: string; message?: string } = {};
  if (!isValidEmail(values.email)) errors.email = contact.errors.email;
  if (values.message.trim().length === 0) errors.message = contact.errors.message;
  if (errors.email || errors.message) return { status: "error", values, errors };

  await new Promise((resolve) => setTimeout(resolve, 700));
  return { status: "sent" };
}
