import type { Metadata } from "next";
import { readAuthProblem } from "@/components/auth/auth-problem";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotForm } from "@/components/auth/forgot-form";
import { auth } from "@/content/auth";

export const metadata: Metadata = { title: "Forgot your password? · Quiz", robots: { index: false } };

/** `?problem=` is why the server turned the form back (bot check failed, too many tries). */
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ problem?: string }> }) {
  const { problem } = await searchParams;
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "lock", caption: auth.forgot.caption }}>
      <ForgotForm problem={readAuthProblem(problem)} />
    </AuthLayout>
  );
}
