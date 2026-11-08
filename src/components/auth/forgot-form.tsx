"use client";

import { Field, Input } from "@/components/ui/field";
import { auth } from "@/content/auth";
import type { AuthProblem } from "@/lib/routes";
import { forgotProblems } from "@/lib/validation";
import { forgotPasswordAction } from "@/server/actions/auth";
import { AuthProblemBanner } from "./auth-problem";
import { AuthHeading, authStack } from "./auth-layout";
import { BackToLogin } from "./back-link";
import { SubmitButton } from "./submit-button";
import { TurnstileWidget } from "./turnstile";
import { useValidatedForm } from "./use-validated-form";

const fields = ["email"] as const;

export function ForgotForm({ problem = null }: { problem?: AuthProblem | null }) {
  const { problems, onSubmit, clear } = useValidatedForm(forgotProblems, fields);
  return (
    <form action={forgotPasswordAction} onSubmit={onSubmit} noValidate className={authStack}>
      <AuthHeading title={auth.forgot.title} sub={auth.forgot.sub} />
      <AuthProblemBanner problem={problem} />
      <Field label={auth.fields.email} htmlFor="forgot-email" error={problems.email ? auth.fieldErrors[problems.email] : undefined}>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={!!problems.email}
          onChange={() => clear("email")}
          aria-describedby={problems.email ? "forgot-email-error" : undefined}
        />
      </Field>
      <TurnstileWidget />
      <SubmitButton>{auth.forgot.submit}</SubmitButton>
      <BackToLogin />
    </form>
  );
}
