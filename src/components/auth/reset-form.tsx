"use client";

import { Field, FieldHint, Input } from "@/components/ui/field";
import { auth } from "@/content/auth";
import type { AuthProblem } from "@/lib/routes";
import { PASSWORD_MIN_LENGTH, resetProblems } from "@/lib/validation";
import { resetPasswordAction } from "@/server/actions/auth";
import { AuthProblemBanner } from "./auth-problem";
import { AuthHeading, authStack } from "./auth-layout";
import { SubmitButton } from "./submit-button";
import { useValidatedForm } from "./use-validated-form";

const fields = ["password", "confirm"] as const;

export function ResetForm({ problem = null }: { problem?: AuthProblem | null }) {
  const { problems, onSubmit, clear } = useValidatedForm(resetProblems, fields);
  return (
    <form action={resetPasswordAction} onSubmit={onSubmit} noValidate className={authStack}>
      <AuthHeading title={auth.reset.title} sub={auth.reset.sub} />
      <AuthProblemBanner problem={problem} />
      <Field label={auth.fields.newPassword} htmlFor="reset-password" error={problems.password ? auth.fieldErrors[problems.password] : undefined}>
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          invalid={!!problems.password}
          onChange={() => clear("password")}
          aria-describedby={problems.password ? "reset-password-error" : "reset-password-hint"}
        />
        {problems.password ? null : <FieldHint id="reset-password-hint">{auth.passwordHint}</FieldHint>}
      </Field>
      <Field label={auth.fields.confirmPassword} htmlFor="reset-confirm" error={problems.confirm ? auth.fieldErrors[problems.confirm] : undefined}>
        <Input
          id="reset-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          invalid={!!problems.confirm}
          onChange={() => clear("confirm")}
          aria-describedby={problems.confirm ? "reset-confirm-error" : undefined}
        />
      </Field>
      <SubmitButton>{auth.reset.submit}</SubmitButton>
    </form>
  );
}
