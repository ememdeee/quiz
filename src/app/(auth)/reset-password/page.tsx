import type { Metadata } from "next";
import { readAuthProblem } from "@/components/auth/auth-problem";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetForm } from "@/components/auth/reset-form";
import { auth } from "@/content/auth";

export const metadata: Metadata = { title: "Set a new password · Quiz", robots: { index: false } };

/** `?problem=same-password` is when the new password is the old one. */
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ problem?: string }> }) {
  const { problem } = await searchParams;
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "lock", caption: auth.reset.caption }}>
      <ResetForm problem={readAuthProblem(problem)} />
    </AuthLayout>
  );
}
