"use client";

import { Field, FieldHint, Input } from "@/components/ui/field";
import { RichText } from "@/components/ui/rich-text";
import { auth } from "@/content/auth";
import type { AuthProblem } from "@/lib/routes";
import { PASSWORD_MIN_LENGTH, registerProblems } from "@/lib/validation";
import { registerAction } from "@/server/actions/auth";
import { AuthProblemBanner } from "./auth-problem";
import { AuthHeading, authLink, authStack } from "./auth-layout";
import { GoogleButton, OrDivider } from "./google-button";
import { SubmitButton } from "./submit-button";
import { TurnstileWidget } from "./turnstile";
import { useValidatedForm } from "./use-validated-form";

const fields = ["name", "email", "password"] as const;

export function RegisterForm({ problem = null }: { problem?: AuthProblem | null }) {
  const { register } = auth;
  const { problems, onSubmit, clear } = useValidatedForm(registerProblems, fields);
  const error = (field: (typeof fields)[number]) => (problems[field] ? auth.fieldErrors[problems[field]] : undefined);
  return (
    <form action={registerAction} onSubmit={onSubmit} noValidate className={authStack}>
      <AuthHeading title={register.title} sub={register.sub} />
      <AuthProblemBanner problem={problem} />
      <GoogleButton />
      <OrDivider />
      <Field label={auth.fields.name} htmlFor="register-name" error={error("name")}>
        <Input id="register-name" name="name" type="text" autoComplete="name" required invalid={!!problems.name} onChange={() => clear("name")} aria-describedby={problems.name ? "register-name-error" : undefined} />
      </Field>
      <Field label={auth.fields.email} htmlFor="register-email" error={error("email")}>
        <Input id="register-email" name="email" type="email" autoComplete="email" required invalid={!!problems.email} onChange={() => clear("email")} aria-describedby={problems.email ? "register-email-error" : undefined} />
      </Field>
      <Field label={auth.fields.password} htmlFor="register-password" error={error("password")}>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          invalid={!!problems.password}
          onChange={() => clear("password")}
          aria-describedby={problems.password ? "register-password-error" : "register-password-hint"}
        />
        {problems.password ? null : <FieldHint id="register-password-hint">{auth.passwordHint}</FieldHint>}
      </Field>
      <TurnstileWidget />
      <SubmitButton>{register.submit}</SubmitButton>
      <p className="m-0 text-sm leading-[21px] text-mute">
        <RichText text={register.agree} linkClassName={authLink} />
      </p>
      <p className="m-0 text-base text-ink-2">
        <RichText text={register.haveAccount} linkClassName={authLink} />
      </p>
    </form>
  );
}
