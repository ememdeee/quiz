"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { DashHeader } from "@/components/dashboard/dash-header";
import { ErrorCard } from "@/components/dashboard/error-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FieldError, FieldHint, Input } from "@/components/ui/field";
import { ArrowLeftIcon, CheckIcon, GoogleIcon, WifiOffIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { accountPage, passwordDialog } from "@/content/dashboard/account";
import { dashErrors, dashLabels } from "@/content/dashboard/common";
import { quizList } from "@/content/dashboard/quizzes";
import { useAccount } from "@/hooks/use-account";
import { routes } from "@/lib/routes";
import { toJson } from "@/lib/responses/export/json";
import { saveFile } from "@/lib/responses/export/download";
import { repos } from "@/server/repos";
import { resetAll } from "@/server/repos/mock/dev";
import { deleteAccountAction } from "@/server/actions/dashboard";
import { DeleteAccountDialog, PasswordDialog } from "./account-dialogs";

const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <section className={`flex flex-col gap-5 rounded-2xl border bg-white p-6 ${className ?? "border-line"}`}>{children}</section>
);

const Row = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center justify-between gap-4">{children}</div>;

/** One file with every response of every quiz, so nothing is lost when the account goes. */
async function downloadEverything() {
  const list = await repos.quizzes.list();
  if (!list.ok) return;
  const all = await Promise.all(
    list.data.map(async (quiz) => {
      const [bundle, set] = await Promise.all([repos.quizzes.get(quiz.id), repos.responses.list(quiz.id)]);
      return bundle.ok && set.ok ? { quiz: quiz.name, responses: JSON.parse(toJson(bundle.data.draft, set.data.responses)) } : null;
    }),
  );
  saveFile(new Blob([JSON.stringify(all.filter(Boolean), null, 2)], { type: "application/json" }), "quiz-responses.json");
}

/** `/account` (boards Account, AccountEmail, AccountGoogleOnly): details, how you log in, delete. */
export function AccountPage() {
  const { account, failed, reload, updateName, requestEmailChange, resendEmailChange, cancelEmailChange, setPassword, connectGoogle } = useAccount();
  const { show } = useToast();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resent, setResent] = useState(false);
  const [dialog, setDialog] = useState<"password" | "delete" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shownName = name ?? account?.name ?? "";
  const shownEmail = email ?? account?.email ?? "";

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const changeName = (value: string) => {
    setName(value);
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await updateName(value);
      setSaving(false);
    }, 600);
  };

  const submitEmail = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!account || shownEmail.trim().toLowerCase() === account.email) return setEmail(null);
    setSaving(true);
    const result = await requestEmailChange(shownEmail);
    setSaving(false);
    setEmailError(!result.ok && result.error === "invalid_email");
    if (result.ok) setEmail(null);
  };

  const savePassword = async (input: { current?: string; next: string }) => {
    const result = await setPassword(input);
    if (result.ok) {
      setDialog(null);
      show({ message: passwordDialog.toast });
      return "ok" as const;
    }
    return result.error === "wrong_password" ? ("wrong_password" as const) : ("failed" as const);
  };

  const deleteAccount = async () => {
    resetAll();
    await deleteAccountAction();
  };

  if (failed) {
    return (
      <>
        <DashHeader />
        <main className="mx-auto max-w-[760px] px-6 py-10">
          <ErrorCard icon={<WifiOffIcon size={24} />} title={quizList.loadFailed.title} action={<Button shape="box" size="sm" onClick={reload}>{quizList.loadFailed.retry}</Button>}>
            {dashErrors.offline.text}
          </ErrorCard>
        </main>
      </>
    );
  }

  return (
    <>
      <DashHeader />
      <main className="mx-auto flex max-w-[760px] flex-col gap-6 px-6 pb-[72px] pt-10">
        <div>
          <ButtonLink href={routes.dashboard} variant="ghost" shape="box" size="sm" className="-ml-3 gap-2 px-3 font-medium">
            <ArrowLeftIcon />
            {accountPage.back}
          </ButtonLink>
          <h1 className="m-0 mt-1 text-[32px] font-bold leading-10">{accountPage.title}</h1>
          <p className="m-0 mt-1 text-[17px] text-ink-2">{accountPage.subtitle}</p>
        </div>

        {!account ? (
          <div role="status" aria-label={dashLabels.loading} className="flex flex-col gap-4">
            <Skeleton className="h-[260px] rounded-2xl" />
            <Skeleton className="h-[170px] rounded-2xl" />
          </div>
        ) : (
          <>
            <Card>
              <h2 className="m-0 text-lg font-bold">{accountPage.details}</h2>
              <Field label={accountPage.name} htmlFor="account-name">
                <Input id="account-name" shape="box" value={shownName} onChange={(e) => changeName(e.target.value)} />
              </Field>
              <form onSubmit={submitEmail} className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <label htmlFor="account-email" className="text-[15px] font-semibold">
                    {accountPage.email}
                  </label>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-[3px] text-[13px] font-semibold text-slate">
                    {account.pendingEmail ? null : <CheckIcon size={12} strokeWidth={3.5} />}
                    {account.pendingEmail ? accountPage.waiting : accountPage.verified}
                  </span>
                </div>
                <Input id="account-email" shape="box" type="email" value={shownEmail} invalid={emailError} onChange={(e) => (setEmail(e.target.value), setEmailError(false))} onBlur={() => void submitEmail()} />
                {emailError ? <FieldError>{accountPage.emailInvalid}</FieldError> : null}
                {account.pendingEmail ? (
                  <FieldHint>
                    {accountPage.sentTo(account.pendingEmail)}{" "}
                    <button
                      type="button"
                      className="rounded-sm font-semibold text-slate underline"
                      onClick={async () => {
                        await resendEmailChange();
                        setResent(true);
                      }}
                    >
                      {resent ? accountPage.sentAgain : accountPage.sendAgain}
                    </button>{" "}
                    ·{" "}
                    <button type="button" className="rounded-sm font-semibold text-slate underline" onClick={() => (setResent(false), void cancelEmailChange())}>
                      {accountPage.cancelChange}
                    </button>
                  </FieldHint>
                ) : (
                  <FieldHint>{accountPage.emailHint}</FieldHint>
                )}
              </form>
            </Card>

            <Card>
              <h2 className="m-0 text-lg font-bold">{accountPage.login}</h2>
              <Row>
                <span>
                  <span className="block text-base font-semibold">{accountPage.password}</span>
                  <span className="text-sm text-mute">{account.hasPassword ? accountPage.passwordNote : accountPage.googleOnlyNote}</span>
                </span>
                <Button shape="box" variant="secondary" onClick={() => setDialog("password")}>
                  {account.hasPassword ? accountPage.changePassword : accountPage.setPassword}
                </Button>
              </Row>
              <div className="border-t border-line" />
              <Row>
                <span className="flex items-center gap-3">
                  <GoogleIcon />
                  <span>
                    <span className="block text-base font-semibold">{accountPage.google}</span>
                    <span className="text-sm text-mute">{account.googleConnected && !account.hasPassword ? accountPage.googleConnectedNote : accountPage.googleNote}</span>
                  </span>
                </span>
                {account.googleConnected ? (
                  <Button shape="box" variant="secondary" disabled>
                    {accountPage.connected}
                  </Button>
                ) : (
                  <Button shape="box" variant="secondary" onClick={() => void connectGoogle()}>
                    {accountPage.connect}
                  </Button>
                )}
              </Row>
            </Card>

            <Card className="border-danger-line">
              <h2 className="m-0 text-lg font-bold text-danger">{accountPage.deleteTitle}</h2>
              <p className="m-0 text-base leading-6 text-ink-2">{accountPage.deleteText}</p>
              <div>
                <Button shape="box" variant="danger-quiet" onClick={() => setDialog("delete")}>
                  {accountPage.deleteButton}
                </Button>
              </div>
            </Card>

            <div role="status" className="text-right text-sm text-mute">
              {saving ? accountPage.saving : accountPage.saved}
            </div>
          </>
        )}
      </main>

      {dialog === "password" && account ? <PasswordDialog hasPassword={account.hasPassword} onSave={savePassword} onClose={() => setDialog(null)} /> : null}
      {dialog === "delete" ? <DeleteAccountDialog onDownload={() => void downloadEverything()} onConfirm={deleteAccount} onClose={() => setDialog(null)} /> : null}
    </>
  );
}
