"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashEvents } from "@/components/dashboard/dash-events";
import type { ActionResult } from "@/lib/errors";
import { repos } from "@/server/repos";
import type { AccountState } from "@/server/repos/ports";

/** The person's own details. Every change returns the result, so a dialog can show what went wrong. */
export function useAccount() {
  const { reportError } = useDashEvents();
  const [account, setAccount] = useState<AccountState | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    const result = await repos.account.get();
    if (result.ok) setAccount(result.data);
    else if (!reportError(result.error)) setFailed(true);
  }, [reportError]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(
    async (request: Promise<ActionResult<AccountState>>) => {
      const result = await request;
      if (result.ok) setAccount(result.data);
      else reportError(result.error);
      return result;
    },
    [reportError],
  );

  return {
    account,
    failed,
    reload: load,
    updateName: (name: string) => run(repos.account.updateName(name)),
    requestEmailChange: (email: string) => run(repos.account.requestEmailChange(email)),
    resendEmailChange: () => run(repos.account.resendEmailChange()),
    cancelEmailChange: () => run(repos.account.cancelEmailChange()),
    setPassword: (input: { current?: string; next: string }) => run(repos.account.setPassword(input)),
    connectGoogle: () => run(repos.account.connectGoogle()),
    disconnectGoogle: () => run(repos.account.disconnectGoogle()),
  };
}
