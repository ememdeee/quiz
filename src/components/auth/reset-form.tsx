"use client";

import { useRef } from "react";
import { Field, FieldHint, Input } from "@/components/ui/field";
import { auth } from "@/content/auth";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { resetPasswordAction } from "@/server/actions/auth";
import { AuthHeading, authStack } from "./auth-layout";
import { SubmitButton } from "./submit-button";

export function ResetForm() {
  const password = useRef<HTMLInputElement>(null);
  const confirm = useRef<HTMLInputElement>(null);

  // The browser's own message tells people the two passwords differ
  const checkMatch = () => {
    confirm.current?.setCustomValidity(password.current?.value === confirm.current?.value ? "" : auth.passwordMismatch);
  };

  return (
    <form action={resetPasswordAction} className={authStack}>
      <AuthHeading title={auth.reset.title} sub={auth.reset.sub} />
      <Field label={auth.fields.newPassword} htmlFor="reset-password">
        <Input
          ref={password}
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          onInput={checkMatch}
          aria-describedby="reset-password-hint"
        />
        <FieldHint id="reset-password-hint">{auth.passwordHint}</FieldHint>
      </Field>
      <Field label={auth.fields.confirmPassword} htmlFor="reset-confirm">
        <Input ref={confirm} id="reset-confirm" name="confirm" type="password" autoComplete="new-password" required onInput={checkMatch} />
      </Field>
      <SubmitButton>{auth.reset.submit}</SubmitButton>
    </form>
  );
}
