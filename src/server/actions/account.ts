"use server";

import { createHash, randomBytes } from "node:crypto";
import { render } from "@react-email/components";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NewAddress, PasswordChanged } from "@emails";
import { fail, ok, type ActionResult } from "@/lib/errors";
import { MEDIA_BUCKET } from "@/lib/media-url";
import { publicEnv } from "@/lib/env";
import { absoluteUrl, routes } from "@/lib/routes";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { requireUser } from "@/server/auth/guards";
import { sendEmail } from "@/server/email/send";
import type { AccountState } from "@/server/repos/ports";
import { createAdminClient } from "@/server/supabase/admin";
import { endSession } from "@/server/session";
import type { Authed } from "@/server/auth/guards";

/** The person's own details and how they log in (handover 7.1, 8.9). */
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const RESEND_WAIT_MS = 60_000;
const DAY_MS = 24 * 60 * 60 * 1000;

async function stateOf(auth: Authed): Promise<AccountState> {
  const { data } = await auth.supabase.auth.getUser();
  const user = data.user;
  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const { data: pending } = await createAdminClient()
    .from("email_changes")
    .select("new_email")
    .eq("user_id", auth.userId)
    .is("confirmed_at", null)
    .is("cancelled_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const hasPassword = providers.includes("email") || user?.user_metadata?.has_password === true;
  const googleConnected = providers.includes("google");
  return {
    name: auth.profile.name,
    email: auth.email,
    pendingEmail: pending?.new_email ?? null,
    hasPassword,
    googleConnected,
    // Supabase keeps an account's last identity, so Google can only go when another one (email) is there too
    canDisconnectGoogle: googleConnected && hasPassword && (user?.identities?.length ?? 0) >= 2,
  };
}

export async function getAccountAction(): Promise<ActionResult<AccountState>> {
  const auth = await requireUser();
  return auth.ok ? ok(await stateOf(auth.data)) : auth;
}

export async function updateNameAction(name: string): Promise<ActionResult<AccountState>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const trimmed = name.trim().slice(0, 100);
  if (trimmed) await auth.data.supabase.from("profiles").update({ name: trimmed }).eq("id", auth.data.userId);
  const fresh = await requireUser();
  return fresh.ok ? ok(await stateOf(fresh.data)) : fresh;
}

/** Makes a new waiting change, mails its link to the NEW address, and drops older waiting changes. The old address keeps working until the link is opened. */
async function sendEmailChange(auth: Authed, newEmail: string): Promise<boolean> {
  const db = createAdminClient();
  await db.from("email_changes").update({ cancelled_at: new Date().toISOString() }).eq("user_id", auth.userId).is("confirmed_at", null).is("cancelled_at", null);
  const token = randomBytes(24).toString("hex");
  const { error } = await db.from("email_changes").insert({ user_id: auth.userId, new_email: newEmail, token_hash: sha256(token), expires_at: new Date(Date.now() + DAY_MS).toISOString() });
  if (error) return false;
  const html = await render(NewAddress({ name: auth.profile.name || "there", newEmail, confirmUrl: `${publicEnv.siteUrl}/auth/email-change/confirm?token=${token}` }));
  const sent = await sendEmail({ to: newEmail, subject: "Confirm your new email address", html });
  return sent.ok;
}

export async function requestEmailChangeAction(email: string): Promise<ActionResult<AccountState>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const next = email.trim().toLowerCase();
  if (!isValidEmail(next)) return fail("invalid_email");
  if (next !== auth.data.email.toLowerCase()) await sendEmailChange(auth.data, next);
  return ok(await stateOf(auth.data));
}

export async function resendEmailChangeAction(): Promise<ActionResult<AccountState>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data: latest } = await createAdminClient()
    .from("email_changes")
    .select("new_email, created_at")
    .eq("user_id", auth.data.userId)
    .is("confirmed_at", null)
    .is("cancelled_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  // At most one email a minute
  if (latest && Date.now() - new Date(latest.created_at).getTime() >= RESEND_WAIT_MS) await sendEmailChange(auth.data, latest.new_email);
  return ok(await stateOf(auth.data));
}

export async function cancelEmailChangeAction(): Promise<ActionResult<AccountState>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  await createAdminClient().from("email_changes").update({ cancelled_at: new Date().toISOString() }).eq("user_id", auth.data.userId).is("confirmed_at", null).is("cancelled_at", null);
  return ok(await stateOf(auth.data));
}

/** Changes the password. A person who already has one must give the current one. Other devices are signed out and an email says it happened. */
export async function setPasswordAction(input: { current?: string; next: string }): Promise<ActionResult<AccountState>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  if (input.next.length < PASSWORD_MIN_LENGTH) return fail("password_short");
  const before = await stateOf(auth.data);

  if (before.hasPassword) {
    // Check the current password on a throwaway client, so this person's own session is not touched
    const checker = createPlainClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await checker.auth.signInWithPassword({ email: auth.data.email, password: input.current ?? "" });
    if (error) return fail("wrong_password");
  }
  const { error } = await auth.data.supabase.auth.updateUser({ password: input.next, data: { has_password: true } });
  if (error) return fail("password_short");
  await auth.data.supabase.auth.signOut({ scope: "others" });

  const today = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
  const html = await render(PasswordChanged({ changedOn: today, resetUrl: absoluteUrl(routes.forgotPassword) }));
  await sendEmail({ to: auth.data.email, subject: "Your Quiz password was changed", html });
  return ok(await stateOf(auth.data));
}

/** Adds Google to an account that logs in with a password. The browser goes to Google and comes back to /auth/callback. */
export async function connectGoogleAction(): Promise<ActionResult<AccountState>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data, error } = await auth.data.supabase.auth.linkIdentity({ provider: "google", options: { redirectTo: `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(routes.account)}` } });
  if (error || !data.url) return fail("load_failed");
  redirect(data.url);
}

/** Removes Google from an account that can still log in another way (gap G6). The person's quizzes and answers are not touched. */
export async function disconnectGoogleAction(): Promise<ActionResult<AccountState>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const before = await stateOf(auth.data);
  if (!before.canDisconnectGoogle) return fail("load_failed");
  const { data } = await auth.data.supabase.auth.getUserIdentities();
  const google = data?.identities.find((identity) => identity.provider === "google");
  if (!google) return ok(before);
  const { error } = await auth.data.supabase.auth.unlinkIdentity(google);
  if (error) return fail("load_failed");
  return ok(await stateOf(auth.data));
}

/** "Delete my account": pictures, then the account itself (quizzes and answers go with it), then the session. */
export async function deleteAccountRealAction(): Promise<ActionResult<null>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const db = createAdminClient();
  const { data: files } = await db.storage.from(MEDIA_BUCKET).list(auth.data.userId, { limit: 1000 });
  if (files && files.length > 0) await db.storage.from(MEDIA_BUCKET).remove(files.map((file) => `${auth.data.userId}/${file.name}`));
  const { error } = await db.auth.admin.deleteUser(auth.data.userId);
  if (error) return fail("load_failed");
  await endSession();
  return ok(null);
}
