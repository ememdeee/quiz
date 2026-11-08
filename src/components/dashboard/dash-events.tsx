"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { dashErrors } from "@/content/dashboard/common";
import type { ErrorCode } from "@/lib/errors";
import { routes } from "@/lib/routes";
import { logoutAction } from "@/server/actions/session";
import { sessionEndedAction } from "@/server/actions/dashboard";
import { writeFlags } from "@/server/repos/mock/flags";

/**
 * Problems that belong to the whole dashboard, not to one screen: the session ended, or the account was
 * suspended while the person was logged in. Any screen reports an error code here; the two session codes open a
 * dialog the person must answer (board DashErrors). Every other code stays with the screen that asked.
 */
type DashEvents = { reportError: (code: ErrorCode) => boolean };

const DashEventsContext = createContext<DashEvents | null>(null);

export function useDashEvents(): DashEvents {
  const context = useContext(DashEventsContext);
  if (!context) throw new Error("useDashEvents needs a DashEventsProvider above it");
  return context;
}

/** The mock keeps these two switches in the browser; clearing them stands in for "the problem is over". */
const clearSessionFlags = () => writeFlags({ loggedOut: false, suspended: false });

export function DashEventsProvider({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState<"logged_out" | "suspended" | null>(null);
  const [pending, startTransition] = useTransition();

  const reportError = useCallback((code: ErrorCode) => {
    if (code === "logged_out" || code === "suspended") {
      setBlocked(code);
      return true;
    }
    return false;
  }, []);
  const events = useMemo(() => ({ reportError }), [reportError]);

  const leave = (action: () => Promise<void>) => () => {
    clearSessionFlags();
    startTransition(() => void action());
  };

  return (
    <DashEventsContext.Provider value={events}>
      {children}
      <Dialog
        open={blocked === "logged_out"}
        dismissible={false}
        title={dashErrors.loggedOut.title}
        description={dashErrors.loggedOut.text}
        actions={
          <Button shape="box" size="sm" loading={pending} onClick={leave(sessionEndedAction)}>
            {dashErrors.loggedOut.logIn}
          </Button>
        }
      />
      <Dialog
        open={blocked === "suspended"}
        dismissible={false}
        title={dashErrors.suspended.title}
        description={dashErrors.suspended.text}
        actions={
          <>
            <Button shape="box" size="sm" variant="secondary" loading={pending} onClick={leave(logoutAction)}>
              {dashErrors.suspended.logOut}
            </Button>
            <ButtonLink shape="box" size="sm" href={routes.contact}>
              {dashErrors.suspended.contact}
            </ButtonLink>
          </>
        }
      />
    </DashEventsContext.Provider>
  );
}
