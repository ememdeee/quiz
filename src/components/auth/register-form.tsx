import { Field, FieldHint, Input } from "@/components/ui/field";
import { RichText } from "@/components/ui/rich-text";
import { auth } from "@/content/auth";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { registerAction } from "@/server/actions/auth";
import { AuthHeading, authLink, authStack } from "./auth-layout";
import { GoogleButton, OrDivider } from "./google-button";
import { SubmitButton } from "./submit-button";

export function RegisterForm() {
  const { register } = auth;
  return (
    <form action={registerAction} className={authStack}>
      <AuthHeading title={register.title} sub={register.sub} />
      <GoogleButton />
      <OrDivider />
      <Field label={auth.fields.name} htmlFor="register-name">
        <Input id="register-name" name="name" type="text" autoComplete="name" required />
      </Field>
      <Field label={auth.fields.email} htmlFor="register-email">
        <Input id="register-email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label={auth.fields.password} htmlFor="register-password">
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          aria-describedby="register-password-hint"
        />
        <FieldHint id="register-password-hint">{auth.passwordHint}</FieldHint>
      </Field>
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
