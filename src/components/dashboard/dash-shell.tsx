"use client";

import { createContext, useContext, type ReactNode } from "react";
import { Banner } from "@/components/ui/banner";
import { WifiOffIcon } from "@/components/ui/icons";
import { ToastProvider } from "@/components/ui/toast";
import { dashErrors } from "@/content/dashboard/common";
import { useOffline } from "@/hooks/use-offline";
import type { SessionUser } from "@/server/session";
import { DashEventsProvider } from "./dash-events";
import { PhoneGate } from "./phone-gate";

const UserContext = createContext<SessionUser | null>(null);

/** The person who is logged in, for the top bars. */
export function useDashUser(): SessionUser {
  const user = useContext(UserContext);
  if (!user) throw new Error("useDashUser needs the DashShell above it");
  return user;
}

/**
 * Everything around a dashboard screen: the toasts, the offline bar and the two "session" dialogs.
 * Phones get the PhoneGate instead. Each screen draws its own top bar (the quiz list and the editor differ).
 */
export function DashShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <UserContext.Provider value={user}>
    <ToastProvider>
      <DashEventsProvider>
        <PhoneGate />
        <div className="min-h-dvh bg-dash font-inter text-slate max-nav:hidden">
          <OfflineBar />
          {children}
        </div>
      </DashEventsProvider>
    </ToastProvider>
    </UserContext.Provider>
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
