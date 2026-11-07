import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { routes } from "@/lib/routes";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = { title: "Create your account · Quiz", robots: { index: false } };

export default async function RegisterPage() {
  if (await getSessionUser()) redirect(routes.dashboard);
  return (
    <AuthLayout panel={{ kind: "build" }}>
      <RegisterForm />
    </AuthLayout>
  );
}
