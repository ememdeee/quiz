"use client";

import type { ReactNode } from "react";
import { AccountMenu } from "@/components/layout/account-menu";
import { Logo } from "@/components/layout/logo";
import { Banner } from "@/components/ui/banner";
import { WifiOffIcon } from "@/components/ui/icons";
import { ToastProvider } from "@/components/ui/toast";
import { dashErrors } from "@/content/dashboard/common";
import { useOffline } from "@/hooks/use-offline";
import { routes } from "@/lib/routes";
import type { SessionUser } from "@/server/session";
import { DashEventsProvider } from "./dash-events";
import { PhoneGate } from "./phone-gate";

/**
 * Everything around a dashboard screen: the top bar with the logo and the account button (board Quizzes),
 * the toasts, the offline bar and the two "session" dialogs. Phones get the PhoneGate instead.
 */
export function DashShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <ToastProvider>
      <DashEventsProvider>
        <PhoneGate />
        <div className="min-h-dvh bg-dash font-inter text-slate max-nav:hidden">
          <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-8 py-3">
            <Logo height={32} href={routes.dashboard} />
            <AccountMenu user={user} />
          </header>
          <OfflineBar />
          {children}
        </div>
      </DashEventsProvider>
    </ToastProvider>
  );
}

function OfflineBar() {
  const offline = useOffline();
  if (!offline) return null;
  return (
    <div className="mx-auto max-w-[1080px] px-8 pt-6">
      <Banner icon={<WifiOffIcon />}>
        <strong>{dashErrors.offline.title}</strong> {dashErrors.offline.text}
      </Banner>
    </div>
  );
}
