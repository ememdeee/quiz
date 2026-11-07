import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create your account · Quiz", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthLayout panel={{ kind: "build" }}>
      <RegisterForm />
    </AuthLayout>
  );
}
