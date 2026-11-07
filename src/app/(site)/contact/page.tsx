import type { Metadata } from "next";
import { ContactView } from "@/components/marketing/contact/contact-view";
import type { ContactFormState } from "@/server/actions/contact";
import { contact, contactTopics } from "@/content/contact";

export const metadata: Metadata = {
  title: "Contact · Quiz",
  description: "Want your own domain, colors or a custom quiz page? Tell us what you need and we’ll reply by email.",
};

/** ?state=error and ?state=sent open the two result screens directly (for testing and the dev link list). */
function initialStateFor(state: string | undefined): ContactFormState {
  if (state === "sent") return { status: "sent" };
  if (state === "error") {
    return {
      status: "error",
      values: { name: "", email: "sarah@", message: "", topics: [contactTopics[0], contactTopics[1]] },
      errors: { email: contact.errors.email, message: contact.errors.message },
    };
  }
  return { status: "idle" };
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  return <ContactView initialState={initialStateFor(state)} />;
}
