"use client";

import { SiteFrame } from "@/components/layout/site-frame";
import { statusPages } from "@/content/status";
import { routes } from "@/lib/routes";
import { StatusPage } from "./status-page";

/** The "something went wrong" page (board Error500). "Try again" asks Next to render the page again. */
export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  const page = statusPages.serverError;
  return (
    <SiteFrame user={null}>
      <StatusPage
        code={["5", "0"]}
        title={page.title}
        text={page.text}
        primary={{ label: page.primary, onClick: onRetry }}
        secondary={{ label: page.secondary, href: routes.contact }}
      />
    </SiteFrame>
  );
}
