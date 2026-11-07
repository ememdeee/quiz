import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { accountHref, verifyEmailExpiredHref } from "@/lib/routes";
import { createAdminClient } from "@/server/supabase/admin";

/**
 * The link in the "Confirm your new email" email (handover 7.2). It sets the new address on the account and marks the change
 * done. The person does not need to be logged in on this device. An old, cancelled or used link shows the expired screen
 * (worded for an email change). A good link lands on the Account page, which says the address was changed.
 */
export async function GET(request: NextRequest) {
  const expired = NextResponse.redirect(new URL(verifyEmailExpiredHref("email-change"), request.url));
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return expired;

  const db = createAdminClient();
  const { data: change } = await db
    .from("email_changes")
    .select("id, user_id, new_email")
    .eq("token_hash", createHash("sha256").update(token).digest("hex"))
    .is("confirmed_at", null)
    .is("cancelled_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!change) return expired;

  const { error } = await db.auth.admin.updateUserById(change.user_id, { email: change.new_email, email_confirm: true });
  if (error) return expired;
  await db.from("email_changes").update({ confirmed_at: new Date().toISOString() }).eq("id", change.id);
  return NextResponse.redirect(new URL(accountHref.emailChanged, request.url));
}
