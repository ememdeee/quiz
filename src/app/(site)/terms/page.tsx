import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/legal-page";
import { terms } from "@/content/legal/terms";

export const metadata: Metadata = { title: "Terms of Service · Quiz" };

export default function TermsPage() {
  return <LegalPage document={terms} />;
}
