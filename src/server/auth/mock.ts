import "server-only";
import { redirect } from "next/navigation";
import { checkMockLogin } from "@/data/mock/accounts";
import { routes, type LoginState } from "@/lib/routes";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { setPendingEmail, startSession } from "@/server/session";

/** The sign-in screens against the dummy accounts (mock mode). They check the form, pick the screen that comes next and move on. */
const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export type LoginFormState = { state: LoginState | null; email: string };

export async function loginMock(_previous: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const email = text(formData, "email");
  const result = checkMockLogin(email, text(formData, "password"));
  if (result === "user" || result === "admin") {
    await startSession(result);
    redirect(routes.dashboard);
  }
  if (result === "unverified") await setPendingEmail(email);
  return { state: result, email };
}

export async function googleLoginMock() {
  await startSession("user");
  redirect(routes.dashboard);
}

export async function registerMock(formData: FormData) {
  const email = text(formData, "email");
  if (!text(formData, "name").trim() || !isValidEmail(email) || text(formData, "password").length < PASSWORD_MIN_LENGTH) {
    redirect(routes.register);
  }
  await setPendingEmail(email);
  redirect(routes.verifyEmail);
}

export async function forgotPasswordMock(formData: FormData) {
  const email = text(formData, "email");
  if (!isValidEmail(email)) redirect(routes.forgotPassword);
  await setPendingEmail(email);
  redirect(routes.forgotPasswordSent);
}

export async function resetPasswordMock(formData: FormData) {
  const password = text(formData, "password");
  if (password.length < PASSWORD_MIN_LENGTH || password !== text(formData, "confirm")) redirect(routes.resetPassword);
  redirect(routes.resetPasswordDone);
}
