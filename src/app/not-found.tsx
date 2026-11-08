import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { StatusPage } from "@/components/marketing/status/status-page";
import { statusPages } from "@/content/status";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Page not found · Quiz" };

export default function NotFound() {
  const page = statusPages.notFound;
  return (
    <SiteShell>
      <StatusPage
        code={["4", "4"]}
        title={page.title}
        text={page.text}
        primary={{ label: page.primary, href: routes.home }}
        secondary={{ label: page.secondary, href: routes.dashboard }}
      />
    </SiteShell>
  );
}
