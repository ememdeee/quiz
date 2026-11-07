"use server";

import { redirect } from "next/navigation";
import { checkMockLogin } from "@/data/mock/accounts";
import { routes, type LoginState } from "@/lib/routes";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { setPendingEmail, startSession } from "@/server/session";

/**
 * Sign-in actions for the UI phase. They check the form, pick the screen that should come
 * next and move on. Phase 4 swaps the insides for Supabase Auth; the screens stay the same.
 */
const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export type LoginFormState = { state: LoginState | null; email: string };

export async function loginAction(_previous: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const email = text(formData, "email");
  const result = checkMockLogin(email, text(formData, "password"));
  if (result === "user" || result === "admin") {
    await startSession(result);
    redirect(routes.dashboard);
  }
  if (result === "unverified") await setPendingEmail(email);
  return { state: result, email };
}

export async function googleLoginAction() {
  await startSession("user");
  redirect(routes.dashboard);
}

export async function registerAction(formData: FormData) {
  const email = text(formData, "email");
  if (!text(formData, "name").trim() || !isValidEmail(email) || text(formData, "password").length < PASSWORD_MIN_LENGTH) {
    redirect(routes.register);
  }
  await setPendingEmail(email);
  redirect(routes.verifyEmail);
}

export async function forgotPasswordAction(formData: FormData) {
  const email = text(formData, "email");
  if (!isValidEmail(email)) redirect(routes.forgotPassword);
  await setPendingEmail(email);
  redirect(routes.forgotPasswordSent);
}

export async function resetPasswordAction(formData: FormData) {
  const password = text(formData, "password");
  if (password.length < PASSWORD_MIN_LENGTH || password !== text(formData, "confirm")) redirect(routes.resetPassword);
  redirect(routes.resetPasswordDone);
}
