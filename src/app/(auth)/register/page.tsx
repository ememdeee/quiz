import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readAuthProblem } from "@/components/auth/auth-problem";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { routes } from "@/lib/routes";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = { title: "Create your account · Quiz", robots: { index: false } };

/** `?problem=` is why the server turned the form back (bot check failed, too many tries). */
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ problem?: string }> }) {
  if (await getSessionUser()) redirect(routes.dashboard);
  const { problem } = await searchParams;
  return (
    <AuthLayout panel={{ kind: "build" }}>
      <RegisterForm problem={readAuthProblem(problem)} />
    </AuthLayout>
  );
}
