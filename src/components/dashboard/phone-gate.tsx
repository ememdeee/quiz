"use client";

import { useState, useTransition } from "react";
import { Logo } from "@/components/layout/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { dashPhone } from "@/content/dashboard/common";
import { routes } from "@/lib/routes";
import { emailDashboardLinkAction } from "@/server/actions/dashboard";

/**
 * What a phone sees instead of the dashboard (board DashPhone). It is the same page as the dashboard, just
 * switched on by screen width in CSS: `nav:hidden` keeps it off computers, the shell hides itself on phones.
 */
export function PhoneGate() {
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const emailLink = () =>
    startTransition(async () => {
      await emailDashboardLinkAction();
      setSent(true);
    });

  return (
    <div className="flex min-h-dvh flex-col bg-page px-5 pb-7 pt-3 font-inter text-ink nav:hidden">
      <div className="flex min-h-14 items-center">
        <Logo height={30} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 text-center">
        <div
          aria-hidden="true"
          className="relative h-28 w-[150px] animate-[float_5s_ease-in-out_infinite_alternate] rounded-[14px] border-[6px] border-slate bg-white shadow-[0_24px_50px_rgba(51,65,85,0.2)]"
        >
          <div className="absolute inset-x-3.5 top-3.5 h-2 rounded bg-line">
            <div className="h-2 w-2/5 rounded bg-slate" />
          </div>
          <div className="absolute left-3.5 top-9 h-3 w-[60px] rounded-md bg-soft" />
          <div className="absolute left-3.5 top-14 h-3 w-[100px] rounded-md bg-soft" />
        </div>
        <div aria-hidden="true" className="-mt-1 h-2 w-[70px] rounded bg-slate" />
        <h1 className="m-0 mt-4 text-[28px] font-extrabold leading-[34px] tracking-[-0.02em]">{dashPhone.title}</h1>
        <p className="m-0 text-[17px] leading-[26px] text-mute">{dashPhone.text}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button size="lg" block loading={pending} disabled={sent} onClick={emailLink}>
          {sent ? dashPhone.linkSent : dashPhone.emailLink}
        </Button>
        <ButtonLink href={routes.home} variant="secondary" size="lg" block>
          {dashPhone.backHome}
        </ButtonLink>
      </div>
    </div>
  );
}
