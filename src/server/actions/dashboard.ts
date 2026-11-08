"use server";

import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { dataMode } from "@/lib/env";
import { deleteAccountRealAction } from "@/server/actions/account";
import { endSession } from "@/server/session";

/** "You've been logged out" dialog: end whatever is left of the session and go to the log in screen. */
export async function sessionEndedAction() {
  await endSession();
  redirect(routes.login);
}

/** Phone message "Email me a link" (mock: nothing is sent; Phase 12 sends the real email). */
export async function emailDashboardLinkAction(): Promise<{ ok: true }> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true };
}

/** "Delete my account": ends the session and says goodbye (mock: Phase 10 deletes the data for real). */
export async function deleteAccountAction() {
  if (dataMode === "supabase") {
    const result = await deleteAccountRealAction();
    if (!result.ok) return;
  } else {
    await endSession();
  }
  redirect(routes.goodbye);
}
