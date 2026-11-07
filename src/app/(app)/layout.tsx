import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashShell } from "@/components/dashboard/dash-shell";
import { routes } from "@/lib/routes";
import { getSessionUser } from "@/server/session";

/** Signed-in area. Logged-out people go to Log in (the real "come back to this page" target is Phase 4). */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect(routes.login);
  return <DashShell user={user}>{children}</DashShell>;
}
