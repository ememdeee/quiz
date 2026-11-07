import { Field, Input } from "@/components/ui/field";
import { auth } from "@/content/auth";
import { forgotPasswordAction } from "@/server/actions/auth";
import { AuthHeading, authStack } from "./auth-layout";
import { BackToLogin } from "./back-link";
import { SubmitButton } from "./submit-button";
import { TurnstileWidget } from "./turnstile";

export function ForgotForm() {
  return (
    <form action={forgotPasswordAction} className={authStack}>
      <AuthHeading title={auth.forgot.title} sub={auth.forgot.sub} />
      <Field label={auth.fields.email} htmlFor="forgot-email">
        <Input id="forgot-email" name="email" type="email" autoComplete="email" required />
      </Field>
      <TurnstileWidget />
      <SubmitButton>{auth.forgot.submit}</SubmitButton>
      <BackToLogin />
    </form>
  );
}
