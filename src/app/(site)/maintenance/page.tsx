import type { Metadata } from "next";
import { StatusPage } from "@/components/marketing/status/status-page";
import { statusPages } from "@/content/status";
import { mailto, routes } from "@/lib/routes";

export const metadata: Metadata = { title: "We’ll be right back · Quiz" };

/** The maintenance screen. The MAINTENANCE_MODE switch that serves it everywhere comes with the middleware work (Phase 13). */
export default function MaintenancePage() {
  const page = statusPages.maintenance;
  return (
    <StatusPage
      code="clock"
      title={page.title}
      text={page.text}
      primary={{ label: page.primary, href: routes.home }}
      secondary={{ label: page.secondary, href: mailto() }}
    />
  );
}
