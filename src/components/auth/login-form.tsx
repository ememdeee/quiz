"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Banner } from "@/components/ui/banner";
import { DisabledButton } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { RichText } from "@/components/ui/rich-text";
import { auth } from "@/content/auth";
import { routes, type LoginState } from "@/lib/routes";
import { loginAction } from "@/server/actions/auth";
import { AuthHeading, authLink, authStack } from "./auth-layout";
import { GoogleButton, OrDivider } from "./google-button";
import { SubmitButton } from "./submit-button";

const errorStates: LoginState[] = ["error", "too-many", "suspended"];
/** States where the "Forgot your password?" link is not shown (the design leaves it out) */
const noForgotLink: LoginState[] = ["unverified", "too-many", "suspended", "google-cancelled"];

/** Log in, with every state the design shows (wrong password, not verified, too many tries, ...). */
export function LoginForm({ initialState, initialEmail }: { initialState: LoginState | null; initialEmail: string }) {
  const [form, formAction] = useActionState(loginAction, { state: initialState, email: initialEmail });
  const { state, email } = form;
  const isError = state !== null && errorStates.includes(state);
  const wrongPassword = state === "error";

  return (
    <form action={formAction} className={authStack}>
      <AuthHeading title={auth.login.title} sub={auth.login.sub} />

      {state ? (
        <Banner tone={isError ? "error" : "info"}>
          <RichText
            text={auth.login.banners[state].replace("{email}", email || auth.placeholderEmail)}
            linkClassName={isError ? "font-bold text-danger-ink underline" : "font-bold text-slate underline"}
          />
        </Banner>
      ) : null}

      {state === "google-exists" ? null : <GoogleButton />}
      {state === "google-exists" ? null : <OrDivider />}

      <Field label={auth.fields.email} htmlFor="login-email">
        <Input id="login-email" name="email" type="email" autoComplete="email" required defaultValue={email} invalid={wrongPassword} />
      </Field>
      <Field label={auth.fields.password} htmlFor="login-password">
        <Input id="login-password" name="password" type="password" autoComplete="current-password" required invalid={wrongPassword} />
        {state && noForgotLink.includes(state) ? null : (
          <Link href={routes.forgotPassword} className={`${authLink} self-end text-sm`}>
            {auth.forgotLink}
          </Link>
        )}
      </Field>

      {state === "too-many" ? (
        <DisabledButton size="lg" block>
          {auth.login.submit}
        </DisabledButton>
      ) : (
        <SubmitButton>{auth.login.submit}</SubmitButton>
      )}

      <p className="m-0 text-base text-ink-2">
        <RichText text={auth.login.newHere} linkClassName={authLink} />
      </p>
    </form>
  );
}
