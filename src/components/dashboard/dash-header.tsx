"use client";

import { AccountMenu } from "@/components/layout/account-menu";
import { Logo } from "@/components/layout/logo";
import { routes } from "@/lib/routes";
import { useDashUser } from "./dash-shell";

/** The top bar of the dashboard home (board Quizzes): the logo and the account button. */
export function DashHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-8 py-3">
      <Logo height={32} href={routes.dashboard} />
      <AccountMenu user={useDashUser()} />
    </header>
  );
}
