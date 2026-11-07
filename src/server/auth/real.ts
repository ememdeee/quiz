import "server-only";
import { redirect } from "next/navigation";
import { isLockedOut, safeNext } from "@/lib/auth-rules";
import { publicEnv } from "@/lib/env";
import { routes, type LoginState } from "@/lib/routes";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { setPendingEmail } from "@/server/session";
import { createClient } from "@/server/supabase/server";
import { clearFailures, recentFailures, recordFailure } from "./lockout";

/**
 * Sign-in with Supabase Auth (handover 7.1). Every function answers the way the screens expect, and none of them says whether
 * an email address already has an account (register and forgot-password always look the same).
 */
const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");
const callback = (path: string) => `${publicEnv.siteUrl}${path}`;

export type LoginFormState = { state: LoginState | null; email: string };

export async function loginReal(_previous: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");
  if (isLockedOut(await recentFailures(email))) return { state: "too-many", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      await setPendingEmail(email);
      return { state: "unverified", email };
    }
    if (error.code === "user_banned") return { state: "suspended", email };
    await recordFailure(email);
    return { state: isLockedOut(await recentFailures(email)) ? "too-many" : "error", email };
  }

  // A suspended person is also marked in their profile, in case the ban has not reached the session yet
  const { data } = await supabase.auth.getUser();
  const { data: profile } = data.user ? await supabase.from("profiles").select("status").eq("id", data.user.id).single() : { data: null };
  if (profile?.status === "suspended") {
    await supabase.auth.signOut();
    return { state: "suspended", email };
  }
  await clearFailures(email);
  redirect(safeNext(text(formData, "next"), routes.dashboard));
}

export async function googleLoginReal() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback("/auth/callback") } });
  if (error || !data.url) redirect(`${routes.login}?state=google-cancelled`);
  redirect(data.url);
}

export async function registerReal(formData: FormData) {
  const name = text(formData, "name").trim();
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");
  if (!name || !isValidEmail(email) || password.length < PASSWORD_MIN_LENGTH) redirect(routes.register);

  const supabase = await createClient();
  // The answer is the same whether or not the address already has an account
  await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: callback("/auth/confirm") } });
  await setPendingEmail(email);
  redirect(routes.verifyEmail);
}

export async function resendVerificationReal(email: string): Promise<{ ok: boolean }> {
  if (!isValidEmail(email)) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: callback("/auth/confirm") } });
  return { ok: !error };
}

export async function forgotPasswordReal(formData: FormData) {
  const email = text(formData, "email").trim().toLowerCase();
  if (!isValidEmail(email)) redirect(routes.forgotPassword);
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback("/auth/confirm") });
  await setPendingEmail(email);
  redirect(routes.forgotPasswordSent);
}

export async function resetPasswordReal(formData: FormData) {
  const password = text(formData, "password");
  if (password.length < PASSWORD_MIN_LENGTH || password !== text(formData, "confirm")) redirect(routes.resetPassword);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  // Only someone who opened a reset link (and so has a recovery session) may set a new password this way
  if (!data.user) redirect(routes.resetPasswordExpired);
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(routes.resetPasswordExpired);
  await supabase.auth.signOut({ scope: "others" });
  redirect(routes.resetPasswordDone);
}

export async function logoutReal() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(routes.home);
}
