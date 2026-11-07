import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/legal-page";
import { privacy } from "@/content/legal/privacy";

export const metadata: Metadata = { title: "Privacy Policy · Quiz" };

export default function PrivacyPage() {
  return <LegalPage document={privacy} />;
}
