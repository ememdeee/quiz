import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetForm } from "@/components/auth/reset-form";
import { auth } from "@/content/auth";

export const metadata: Metadata = { title: "Set a new password · Quiz", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "lock", caption: auth.reset.caption }}>
      <ResetForm />
    </AuthLayout>
  );
}
