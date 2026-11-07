import type { Metadata } from "next";
import Link from "next/link";
import { ButtonsSection, ChoicesSection, FieldsSection } from "@/components/dev/gallery-basics";
import { FeedbackSections } from "@/components/dev/gallery-feedback";
import { ToastProvider } from "@/components/ui/toast";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "UI kit · Quiz", robots: { index: false } };

/** Dev only: every dashboard building block in every state (also the visual check page). */
export default function UiKitPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-page font-inter text-ink">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-7 px-6 py-10">
          <div>
            <Link href={routes.dev} className="text-sm font-semibold text-slate underline">Test links</Link>
            <h1 className="m-0 mt-2 text-[34px] font-extrabold leading-10 tracking-[-0.03em]">UI kit</h1>
            <p className="m-0 mt-1 text-base text-mute">Buttons, fields, choices, menus, dialogs, messages, labels, tabs, tables and more, as in the design boards. Dev only.</p>
          </div>
          <ButtonsSection />
          <FieldsSection />
          <ChoicesSection />
          <FeedbackSections />
        </div>
      </div>
    </ToastProvider>
  );
}
