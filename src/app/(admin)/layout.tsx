import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { NoAccess } from "@/components/admin/no-access";
import { DashShell } from "@/components/dashboard/dash-shell";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = { title: "Admin · Quiz", robots: { index: false, follow: false } };

/**
 * The admin area. Only admins get in. Everyone else, logged in or not, sees the same plain "no access" page, which says
 * nothing about what is behind it (handover 8.10).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return <NoAccess />;
  return (
    <DashShell user={user}>
      <AdminShell>{children}</AdminShell>
    </DashShell>
  );
}
