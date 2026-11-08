"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ErrorCard } from "@/components/dashboard/error-card";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Segmented, Switch } from "@/components/ui/controls";
import { Field, Input, Textarea } from "@/components/ui/field";
import { AlertCircleIcon, ArrowLeftIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { adminDialogs, personPage } from "@/content/admin";
import { usePerson } from "@/hooks/use-admin";
import { freeLimitHints, parseLimit } from "@/lib/admin/people";
import type { AdminPerson, PlanPatch } from "@/lib/admin/types";
import { formatLongDate } from "@/lib/quiz/calendar";
import { formatNumber, timeAgo } from "@/lib/format";
import { NO_OVERRIDES, planName, type Plan } from "@/lib/plan/limits";
import { adminHref } from "@/lib/routes";
import { DeletePersonDialog, SuspendDialog } from "./person-dialogs";

const card = "flex flex-col gap-[18px] rounded-2xl border border-line bg-white p-6";
const cardTitle = "m-0 text-lg font-bold text-ink";

const firstName = (person: AdminPerson) => person.name.split(" ")[0];

/** `/admin/users/[userId]`: one person, their plan and limits, and the careful actions (boards AdminUser and AdminDialogs). */
export function PersonPage({ personId, selfEmail }: { personId: string; selfEmail: string }) {
  const person = usePerson(personId);
  const words = personPage;

  return (
    <main className="mx-auto flex max-w-[900px] flex-col gap-[22px] px-6 pb-[72px] pt-7">
      <Link
        href={adminHref.users}
        className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-medium text-slate no-underline focus-visible:outline-[3px] focus-visible:outline-slate"
      >
        <ArrowLeftIcon />
        {words.back}
      </Link>
      {person.state.status === "loading" ? (
        <div aria-busy="true" className="flex flex-col gap-5">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-[420px] rounded-2xl" />
          <Skeleton className="h-[200px] rounded-2xl" />
        </div>
      ) : null}
      {person.state.status === "error" ? (
        <ErrorCard
          title={person.state.notFound ? words.notFoundTitle : words.errorTitle}
          action={
            person.state.notFound ? (
              <Link href={adminHref.users} className="text-[15px] font-semibold text-slate">
                {words.back}
              </Link>
            ) : (
              <Button shape="box" variant="secondary" size="sm" onClick={person.reload}>
                {words.tryAgain}
              </Button>
            )
          }
        >
          {person.state.notFound ? words.notFoundText : words.loadFailed}
        </ErrorCard>
      ) : null}
      {person.state.status === "ready" ? <PersonView person={person.state.data} isSelf={person.state.data.email === selfEmail} api={person} /> : null}
    </main>
  );
}

type Api = ReturnType<typeof usePerson>;

function PersonView({ person, isSelf, api }: { person: AdminPerson; isSelf: boolean; api: Api }) {
  const words = personPage;
  const router = useRouter();
  const { show } = useToast();
  const [dialog, setDialog] = useState<"suspend" | "delete" | null>(null);

  return (
    <>
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-[30px] font-extrabold leading-[38px] tracking-[-0.02em] text-ink">{person.name}</h1>
          <Pill tone={person.plan === "custom" ? "solid" : "neutral"} className="px-2.5 py-[3px] text-xs">
            {planName(person.plan)}
          </Pill>
          <Pill tone={person.emailVerified ? "soft" : "neutral"} className="px-2.5 py-[3px] text-xs">
            {person.emailVerified ? words.verified : words.notVerified}
          </Pill>
          {person.suspendedAt ? (
            <Pill tone="outline" className="px-2.5 py-[3px] text-xs">
              {words.suspendedPill}
            </Pill>
          ) : null}
        </div>
        <p className="m-0 mt-1 text-[15px] text-mute">
          {[person.email, words.signedUp(formatLongDate(person.signedUpAt.slice(0, 10))), person.signsInWithGoogle ? words.google : null].filter(Boolean).join(" · ")}
        </p>
      </header>

      {person.suspendedAt ? (
        <Banner
          tone="error"
          icon={<AlertCircleIcon />}
        >
          <span className="flex flex-wrap items-center justify-between gap-3">
            <span>
              <strong>{adminDialogs.banner.title}</strong> {adminDialogs.banner.text(formatLongDate(person.suspendedAt.slice(0, 10)))}
            </span>
            <Button
              shape="box"
              size="sm"
              variant="secondary"
              onClick={async () => {
                const result = await api.restore();
                if (result.ok) show({ message: adminDialogs.banner.restored(person.name) });
              }}
            >
              {adminDialogs.banner.restore}
            </Button>
          </span>
        </Banner>
      ) : null}

      <PlanCard key={`${person.id}-${person.plan}-${JSON.stringify(person.overrides)}`} person={person} onSave={api.setPlan} />
      <QuizzesCard person={person} />
      <NotesCard person={person} onSave={api.setNotes} />

      <section className={`${card} border-danger-line`}>
        <h2 className={`${cardTitle} text-danger`}>{words.careful}</h2>
        <div className="flex flex-wrap gap-3">
          <Button shape="box" size="sm" variant="danger-quiet" disabled={isSelf || person.suspendedAt !== null} onClick={() => setDialog("suspend")}>
            {words.suspend}
          </Button>
          <Button shape="box" size="sm" variant="danger-quiet" disabled={isSelf} onClick={() => setDialog("delete")}>
            {words.delete}
          </Button>
        </div>
        <span className="text-sm text-mute">{isSelf ? words.ownAccount : words.carefulNote}</span>
      </section>

      {dialog === "suspend" ? (
        <SuspendDialog
          person={person}
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            const result = await api.suspend();
            if (!result.ok) return false;
            setDialog(null);
            show({ message: adminDialogs.suspend.done(person.name) });
            return true;
          }}
        />
      ) : null}
      {dialog === "delete" ? (
        <DeletePersonDialog
          person={person}
          onClose={() => setDialog(null)}
          onConfirm={async (typed) => {
            const result = await api.remove(typed);
            if (!result.ok) return false;
            show({ message: adminDialogs.remove.done(person.name) });
            router.push(adminHref.users);
            return true;
          }}
        />
      ) : null}
    </>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-3.5 py-3 text-[15px] font-semibold">
      <label htmlFor={`switch-${label}`}>{label}</label>
      <Switch id={`switch-${label}`} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/** The Plan card. Free has no settings of its own; Custom opens the switches, the domain and the three limits. */
function PlanCard({ person, onSave }: { person: AdminPerson; onSave: Api["setPlan"] }) {
  const words = personPage;
  const { show } = useToast();
  const [plan, setPlan] = useState<Plan>(person.plan);
  const [brand, setBrand] = useState(person.brandColors);
  const [hide, setHide] = useState(person.hidePoweredBy);
  const [domain, setDomain] = useState(person.customDomain ?? "");
  const [limits, setLimits] = useState({
    quizzes: person.overrides.maxQuizzes?.toString() ?? "",
    pages: person.overrides.maxPages?.toString() ?? "",
    responses: person.overrides.maxResponses?.toString() ?? "",
  });
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const save = async () => {
    const parsed = { quizzes: parseLimit(limits.quizzes), pages: parseLimit(limits.pages), responses: parseLimit(limits.responses) };
    const custom = plan === "custom";
    const bad = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, custom && value === undefined]));
    setInvalid(bad);
    if (Object.values(bad).some(Boolean)) return;

    // Free means the standard plan: nothing extra stays switched on and no limit is raised
    const patch: PlanPatch = custom
      ? {
          plan,
          brandColors: brand,
          hidePoweredBy: hide,
          customDomain: domain.trim() === "" ? null : domain.trim().toLowerCase(),
          overrides: { maxQuizzes: parsed.quizzes ?? null, maxPages: parsed.pages ?? null, maxResponses: parsed.responses ?? null },
        }
      : { plan, brandColors: false, hidePoweredBy: false, customDomain: null, overrides: NO_OVERRIDES };

    setPending(true);
    setFailed(false);
    const result = await onSave(patch);
    setPending(false);
    if (result.ok) show({ message: words.saved(firstName(person)) });
    else setFailed(true);
  };

  const limitBox = (key: keyof typeof limits, label: string, hint: number) => (
    <Field label={label} htmlFor={`limit-${key}`} hint={words.freeHint(hint)} error={invalid[key] ? words.limitInvalid : undefined}>
      <Input
        id={`limit-${key}`}
        shape="box"
        inputMode="numeric"
        autoComplete="off"
        value={limits[key]}
        invalid={invalid[key]}
        onChange={(event) => setLimits((current) => ({ ...current, [key]: event.target.value }))}
        placeholder={formatNumber(hint)}
      />
    </Field>
  );

  return (
    <section className={card}>
      <h2 className={cardTitle}>{words.plan}</h2>
      <Segmented
        aria-label={words.plan}
        value={plan}
        onValueChange={(value) => setPlan(value as Plan)}
        options={[
          { value: "free", label: words.planFree },
          { value: "custom", label: words.planCustom },
        ]}
      />

      {plan === "custom" ? (
        <>
          <div className="flex flex-col gap-2.5">
            <SwitchRow label={words.brandColors} checked={brand} onChange={setBrand} />
            <SwitchRow label={words.hidePowered} checked={hide} onChange={setHide} />
          </div>
          <Field label={words.domain} htmlFor="custom-domain" hint={words.domainHint}>
            <Input id="custom-domain" shape="box" value={domain} onChange={(event) => setDomain(event.target.value)} autoComplete="off" />
          </Field>
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 p-0 text-[15px] font-semibold text-ink">{words.limits}</legend>
            <div className="grid gap-3.5 sm:grid-cols-3">
              {limitBox("quizzes", words.limitQuizzes, freeLimitHints.quizzes)}
              {limitBox("pages", words.limitPages, freeLimitHints.pages)}
              {limitBox("responses", words.limitResponses, freeLimitHints.responses)}
            </div>
          </fieldset>
        </>
      ) : (
        <p className="m-0 text-[15px] text-mute">{words.freeNote}</p>
      )}

      {failed ? (
        <Banner tone="error" icon={<AlertCircleIcon />}>
          <span className="flex flex-wrap items-center justify-between gap-3">
            {words.saveFailed}
            <Button shape="box" size="sm" variant="secondary" onClick={save}>
              {words.tryAgain}
            </Button>
          </span>
        </Banner>
      ) : null}

      <div className="flex items-center justify-end gap-3.5 border-t border-soft pt-4">
        <span className="text-sm text-mute">{words.changesRightAway}</span>
        <Button shape="box" loading={pending} onClick={save}>
          {words.savePlan}
        </Button>
      </div>
    </section>
  );
}

const statusTone = { open: "solid", closed: "neutral", not_published: "outline" } as const;

function QuizzesCard({ person }: { person: AdminPerson }) {
  const words = personPage;
  const columns: ReactNode[] = [words.quizColumns.quiz, words.quizColumns.status, words.quizColumns.responses, words.quizColumns.edited];
  return (
    <section className={card}>
      <h2 className={cardTitle}>{words.quizzes}</h2>
      {person.quizzes.length === 0 ? (
        <p className="m-0 text-[15px] text-mute">{words.noQuizzes}</p>
      ) : (
        <div role="table" aria-label={words.quizzes}>
          <div role="row" className="grid grid-cols-[minmax(0,1.4fr)_110px_110px_130px] gap-3 pb-3 text-[13px] font-bold uppercase tracking-[0.04em] text-mute">
            {columns.map((label, index) => (
              <span key={index} role="columnheader">
                {label}
              </span>
            ))}
          </div>
          {person.quizzes.map((quiz) => (
            <div key={quiz.id} role="row" className="grid grid-cols-[minmax(0,1.4fr)_110px_110px_130px] items-center gap-3 border-t border-soft py-3 text-[15px]">
              <span role="cell" className="truncate font-semibold text-ink">
                {quiz.name}
              </span>
              <span role="cell">
                <Pill tone={statusTone[quiz.status]} className="px-2.5 py-[3px] text-xs">
                  {words.status[quiz.status]}
                </Pill>
              </span>
              <span role="cell">{formatNumber(quiz.responses)}</span>
              <span role="cell" className="text-mute">
                {timeAgo(quiz.updatedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** Private notes. They save when the admin leaves the box (the board has no Save button). */
function NotesCard({ person, onSave }: { person: AdminPerson; onSave: Api["setNotes"] }) {
  const words = personPage;
  const [notes, setNotes] = useState(person.notes);
  return (
    <section className={card}>
      <h2 className={cardTitle}>{words.notes}</h2>
      <Textarea
        shape="box"
        aria-label={words.notesLabel}
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={() => notes !== person.notes && void onSave(notes)}
      />
      <span className="text-sm text-mute">{words.notesHint}</span>
    </section>
  );
}
