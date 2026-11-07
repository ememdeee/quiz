"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ChevronRightIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { softHover } from "@/components/ui/link-styles";
import { siteLabels, siteNavLinks } from "@/content/site";
import { createQuizHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/server/session";
import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";

const pill =
  "mx-auto flex max-w-[1096px] items-center justify-between gap-2 rounded-full border border-line bg-white/95 p-1.5 pl-[18px] shadow-[0_8px_30px_rgba(51,65,85,0.08)] nav:gap-4 nav:p-2 nav:pl-6";

const navLink = cn(
  "inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-medium text-ink no-underline focus-visible:outline-[3px] focus-visible:outline-slate",
  softHover,
);

/**
 * Website navigation (boards SiteNav, SiteNavIn, SiteNavMobile, SiteNavMobileIn, SiteNavMobileOpen).
 * One component: the computer layout from 900 px up, the phone bar with a full-screen menu below.
 */
export function SiteNav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const loggedIn = user !== null;

  // Close the phone menu whenever the page changes
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    // One frame later: the menu only becomes focusable once its fade has started
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      openRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const createHref = createQuizHref(loggedIn);
  const menuLinks = [...siteNavLinks, ...(loggedIn ? [] : [{ label: siteLabels.logIn, href: routes.login }])];

  return (
    <div className="sticky top-0 z-30 px-3 pt-3 nav:px-6">
      <nav aria-label={siteLabels.mainNav} className={pill}>
        <Logo height={32} />

        {/* Computer */}
        <div className="flex items-center gap-0.5 max-nav:hidden">
          {siteNavLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={cn(navLink, active && "bg-soft")}>
                {link.label}
              </Link>
            );
          })}
          {loggedIn ? null : (
            <Link href={routes.login} className={navLink}>
              {siteLabels.logIn}
            </Link>
          )}
          <ButtonLink href={createHref} size="sm" className="ml-1.5">
            {loggedIn ? siteLabels.myQuizzes : siteLabels.createQuiz}
          </ButtonLink>
          {user ? <AccountMenu user={user} /> : null}
        </div>

        {/* Phone */}
        <div className="flex items-center gap-1.5 nav:hidden">
          <ButtonLink href={createHref} size="sm" className="whitespace-nowrap px-[18px] text-sm">
            {loggedIn ? siteLabels.myQuizzes : siteLabels.createQuiz}
          </ButtonLink>
          <button
            ref={openRef}
            type="button"
            aria-label={siteLabels.openMenu}
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="grid size-11 place-items-center rounded-full bg-soft text-slate transition-colors duration-200 hover:bg-line focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/*
        The phone menu is always in the page and only fades and slides (opacity and translate, nothing that
        re-lays-out the page), so opening and closing are smooth and light. It scrolls by itself, so the
        page behind needs no lock.
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={siteLabels.menu}
        inert={!open}
        className={cn(
          "fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-page px-3 pb-7 pt-2.5 font-inter text-ink nav:hidden",
          "transition-[opacity,translate,visibility] duration-300 ease-out",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0",
        )}
      >
        <div className="flex items-center justify-between rounded-full border border-line bg-white p-1.5 pl-[18px]">
          <Logo height={28} />
          <button
            ref={closeRef}
            type="button"
            aria-label={siteLabels.closeMenu}
            onClick={() => {
              setOpen(false);
              openRef.current?.focus();
            }}
            className="grid size-11 place-items-center rounded-full bg-slate text-white transition-colors duration-200 hover:bg-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label={siteLabels.menu} className="mt-7 flex flex-col px-3">
          {menuLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
              className={cn(
                "flex min-h-[68px] items-center justify-between text-[26px] font-bold tracking-[-0.02em] text-ink no-underline transition-[opacity,translate,color] duration-300 ease-out hover:text-slate",
                i < menuLinks.length - 1 && "border-b border-line",
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
              )}
            >
              {link.label}
              <ChevronRightIcon className="text-ctrl" />
            </Link>
          ))}
        </nav>
        <ButtonLink href={createHref} size="lg" onClick={() => setOpen(false)} className="mx-3 mt-auto min-h-[60px]">
          {loggedIn ? siteLabels.myQuizzes : siteLabels.createQuiz}
        </ButtonLink>
      </div>
    </div>
  );
}
