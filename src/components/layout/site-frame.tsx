import type { ReactNode } from "react";
import type { SessionUser } from "@/server/session";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";

/** Navigation, page and footer. Works on the server and in error screens that run in the browser. */
export function SiteFrame({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-page font-inter text-ink">
      <SiteNav user={user} />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
