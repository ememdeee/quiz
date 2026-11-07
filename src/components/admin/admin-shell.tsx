"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useDashUser } from "@/components/dashboard/dash-shell";
import { AccountMenu } from "@/components/layout/account-menu";
import { Logo } from "@/components/layout/logo";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { tabClass, tabsListClass } from "@/components/ui/tabs";
import { adminNav } from "@/content/admin";
import { adminHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** The top bar of every admin screen: the "Admin" label, Overview | Users, a way back to the owner's own quizzes, and the account button. */
export function AdminShell({ children }: { children: ReactNode }) {
  const user = useDashUser();
  const path = usePathname();
  const inUsers = path.startsWith(adminHref.users);
  const onPerson = path.startsWith(`${adminHref.users}/`);

  return (
    <>
      <header className="flex flex-wrap items-center gap-4 border-b border-line bg-white px-8 py-3">
        <Logo height={30} href={adminHref.overview} />
        <Pill tone="solid" className="bg-ink px-2.5 py-[3px] text-xs">
          {adminNav.badge}
        </Pill>
        <nav aria-label={adminNav.sections} className={cn(tabsListClass, "ml-3")}>
          <Link href={adminHref.overview} aria-current={!inUsers ? "page" : undefined} className={cn(tabClass, "no-underline")}>
            {adminNav.overview}
          </Link>
          <Link href={adminHref.users} aria-current={inUsers ? "page" : undefined} className={cn(tabClass, "no-underline")}>
            {adminNav.users}
          </Link>
        </nav>
        <span className="grow" />
        {onPerson ? null : (
          <Link
            href={routes.dashboard}
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] px-3.5 text-[15px] font-medium text-slate no-underline hover:bg-soft focus-visible:outline-[3px] focus-visible:outline-slate"
          >
            {adminNav.myQuizzes}
            <ArrowUpRightIcon />
          </Link>
        )}
        <AccountMenu user={user} />
      </header>
      {children}
    </>
  );
}

/** Title block shared by the admin pages. */
export function AdminTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="m-0 text-[30px] font-extrabold leading-[38px] tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle ? <p className="m-0 mt-0.5 text-[15px] text-mute">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
