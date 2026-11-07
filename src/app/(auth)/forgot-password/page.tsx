import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotForm } from "@/components/auth/forgot-form";
import { auth } from "@/content/auth";

export const metadata: Metadata = { title: "Forgot your password? · Quiz", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout panel={{ kind: "glyph", glyph: "lock", caption: auth.forgot.caption }}>
      <ForgotForm />
    </AuthLayout>
  );
}
