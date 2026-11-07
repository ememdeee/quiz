"use server";

import { dataMode } from "@/lib/env";
import { isValidEmail } from "@/lib/validation";
import { getPendingEmail } from "@/server/session";
import { forgotPasswordMock, googleLoginMock, loginMock, registerMock, resetPasswordMock, type LoginFormState } from "@/server/auth/mock";
import { forgotPasswordReal, googleLoginReal, loginReal, registerReal, resendVerificationReal, resetPasswordReal } from "@/server/auth/real";

/**
 * The sign-in actions the screens call. In mock mode they use the dummy accounts; in supabase mode they use Supabase Auth.
 * The screens do not know which (handover 4.3).
 */
export type { LoginFormState };

const real = dataMode === "supabase";

export async function loginAction(previous: LoginFormState, formData: FormData): Promise<LoginFormState> {
  return real ? loginReal(previous, formData) : loginMock(previous, formData);
}

export async function googleLoginAction() {
  return real ? googleLoginReal() : googleLoginMock();
}

export async function registerAction(formData: FormData) {
  return real ? registerReal(formData) : registerMock(formData);
}

export async function forgotPasswordAction(formData: FormData) {
  return real ? forgotPasswordReal(formData) : forgotPasswordMock(formData);
}

export async function resetPasswordAction(formData: FormData) {
  return real ? resetPasswordReal(formData) : resetPasswordMock(formData);
}

/** "Send the email again" on the check-your-email screen (60 seconds apart; the wait is enforced by Supabase too). */
export async function resendVerificationAction(): Promise<{ ok: boolean }> {
  const email = (await getPendingEmail()) ?? "";
  if (!isValidEmail(email)) return { ok: false };
  if (!real) return { ok: true };
  return resendVerificationReal(email);
}
