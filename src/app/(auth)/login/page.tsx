import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/content/auth";
import { loginStates, type LoginState } from "@/lib/routes";
import { getPendingEmail } from "@/server/session";

export const metadata: Metadata = { title: "Log in · Quiz", robots: { index: false } };

/** States whose design shows the email already filled in. */
const prefilled: LoginState[] = ["error", "suspended", "google-exists"];

/** ?state=... opens each login screen directly (the dev link list uses this). */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const initial = loginStates.find((s) => s === state) ?? null;
  const email = initial && prefilled.includes(initial) ? ((await getPendingEmail()) ?? auth.placeholderEmail) : "";
  return (
    <AuthLayout panel={{ kind: "leave" }}>
      <LoginForm initialState={initial} initialEmail={email} />
    </AuthLayout>
  );
}
