"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { HelpIcon, LogoutIcon, ShieldCheckIcon, StarIcon, UserIcon } from "@/components/ui/icons";
import { softHover } from "@/components/ui/link-styles";
import { accountMenuItems, siteLabels } from "@/content/site";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { logoutAction } from "@/server/actions/session";
import type { SessionUser } from "@/server/session";

const item =
  cn("flex min-h-12 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] font-medium text-slate no-underline focus-visible:outline-[3px] focus-visible:outline-slate", softHover);

/** The round account button in the logged-in navigation, with its dropdown (board "AccountMenu"). */
export function AccountMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={siteLabels.accountMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "grid size-11 place-items-center rounded-full border border-line bg-soft text-slate transition-colors duration-200 hover:bg-line focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate",
          open && "bg-slate text-white ring-[3px] ring-white outline-offset-0",
        )}
      >
        <UserIcon />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] z-40 w-[300px] animate-[appear_0.2s_ease-out] rounded-2xl border border-line bg-white p-2 shadow-[0_16px_40px_rgba(51,65,85,0.18)]"
        >
          <div className="mb-1.5 flex items-center gap-3 border-b border-line p-3">
            <Avatar className="border-0" />
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-slate">{user.name}</span>
              <span className="block truncate text-sm text-mute">{user.email}</span>
            </span>
          </div>
          <Link role="menuitem" href={routes.account} className={item}>
            <UserIcon size={20} />
            {accountMenuItems.settings}
          </Link>
          <Link role="menuitem" href={routes.pricing} className={item}>
            <StarIcon />
            {accountMenuItems.plans}
          </Link>
          <Link role="menuitem" href={routes.contact} className={item}>
            <HelpIcon />
            {accountMenuItems.help}
          </Link>
          {user.isAdmin ? (
            <Link role="menuitem" href={routes.admin} className={cn(item, "bg-soft")}>
              <ShieldCheckIcon />
              {accountMenuItems.admin}
              <span className="ml-auto text-xs text-mute">{accountMenuItems.adminNote}</span>
            </Link>
          ) : null}
          <div className="my-1.5 border-t border-line" />
          <form action={logoutAction}>
            <button type="submit" role="menuitem" className={item}>
              <LogoutIcon />
              {accountMenuItems.logOut}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
