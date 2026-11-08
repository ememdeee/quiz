import type { ReactNode } from "react";
import { getSessionUser } from "@/server/session";
import { SiteFrame } from "./site-frame";

/** The frame for every server-rendered website page: it looks up who is logged in. */
export async function SiteShell({ children }: { children: ReactNode }) {
  return <SiteFrame user={await getSessionUser()}>{children}</SiteFrame>;
}
