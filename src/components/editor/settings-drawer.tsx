"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Spinner } from "@/components/ui/button";
import { Switch } from "@/components/ui/controls";
import { Drawer } from "@/components/ui/drawer";
import { Field, FieldError, FieldHint, Input } from "@/components/ui/field";
import { CloseIcon, LockIcon } from "@/components/ui/icons";
import { settings } from "@/content/dashboard/settings";
import { saveStatusText } from "@/content/dashboard/common";
import type { SaveState } from "@/components/ui/save-status";
import { quizStatus } from "@/lib/quizzes/list";
import type { QuizSummary } from "@/lib/quizzes/types";
import { routes } from "@/lib/routes";
import { repos } from "@/server/repos";
import { useDashEvents } from "@/components/dashboard/dash-events";
import { useEditor, useEditorActions } from "./editor-context";

/** "checking" is the request itself (the field is locked then); "pending" is a free address of a live quiz that waits for Publish. */
type SlugState = { status: "idle" } | { status: "checking" } | { status: "ok" } | { status: "pending" } | { status: "problem"; reason: "taken" | "invalid" | "reserved" };

/** The quiz name, web address and the on/off for answers, as a panel from the right (board Settings). */
export function SettingsDrawer({
  quiz,
  save,
  onQuiz,
  pendingSlug,
  onPendingSlug,
  onDelete,
  onClose,
}: {
  quiz: QuizSummary;
  save: SaveState;
  onQuiz: (quiz: QuizSummary) => void;
  /** A new address of a live quiz that is waiting for Publish (the quiz itself keeps its old one until then) */
  pendingSlug: string | null;
  onPendingSlug: (slug: string | null) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { reportError } = useDashEvents();
  const name = useEditor((s) => s.doc.name);
  const { setName } = useEditorActions();
  const [slug, setSlug] = useState(pendingSlug ?? quiz.slug);
  const [slugState, setSlugState] = useState<SlugState>(pendingSlug ? { status: "pending" } : { status: "idle" });
  const slugInput = useRef<HTMLInputElement>(null);
  const [switching, setSwitching] = useState(false);
  const published = quizStatus(quiz) !== "not_published";

  // Check the address a moment after typing stops. A live quiz keeps its shared address until Publish (the new one waits in
  // `pendingSlug`); a quiz that was never published takes the new address at once, because no link to it exists yet.
  useEffect(() => {
    const chosen = pendingSlug ?? quiz.slug;
    if (slug === chosen) {
      // Nothing new to check: keep what the field already says (free and waiting, or free and saved)
      return setSlugState((current) => (current.status === "ok" || current.status === "pending" ? current : { status: "idle" }));
    }
    if (slug === quiz.slug) {
      // Typed the live address back: the waiting change is gone
      onPendingSlug(null);
      return setSlugState({ status: "idle" });
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSlugState({ status: "checking" });
      const check = await repos.quizzes.slugAvailable(quiz.id, slug);
      if (cancelled) return;
      // A check that could not be answered (too many checks in a minute, or the connection) stops the spinner; typing again asks again
      if (!check.ok) return void (reportError(check.error) || setSlugState({ status: "idle" }));
      if (!check.data.available) return setSlugState({ status: "problem", reason: check.data.reason });
      if (published) {
        onPendingSlug(slug);
        return setSlugState({ status: "pending" });
      }
      const saved = await repos.quizzes.setSlug(quiz.id, slug);
      if (cancelled) return;
      if (saved.ok) {
        onQuiz(saved.data);
        setSlugState({ status: "ok" });
      } else if (!reportError(saved.error)) setSlugState({ status: "problem", reason: saved.error === "slug_taken" ? "taken" : "invalid" });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, pendingSlug, published, quiz.id, quiz.slug, onQuiz, onPendingSlug, reportError]);

  // The field is locked while the check runs, which takes the cursor away: give it back when the answer is in
  const checking = slugState.status === "checking";
  const wasChecking = useRef(false);
  useEffect(() => {
    if (wasChecking.current && !checking) slugInput.current?.focus({ preventScroll: true });
    wasChecking.current = checking;
  }, [checking]);

  const toggleAccepting = async (accepting: boolean) => {
    setSwitching(true);
    const result = await repos.quizzes.setAcceptingResponses(quiz.id, accepting);
    setSwitching(false);
    if (result.ok) onQuiz(result.data);
    else reportError(result.error);
  };

  const problem = slugState.status === "problem" ? settings.addressErrors[slugState.reason] : null;

  return (
    <Drawer
      title={settings.title}
      onClose={onClose}
      headerEnd={
        <Button shape="box" variant="secondary" aria-label={settings.close} onClick={onClose} className="size-11 px-0">
          <CloseIcon size={18} />
        </Button>
      }
      footer={
        <>
          <button
            type="button"
            onClick={onDelete}
            className="min-h-11 rounded-md px-1 text-[15px] font-semibold text-danger underline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
          >
            {settings.deleteQuiz}
          </button>
          <span role="status" className="text-sm text-mute">
            {save === "saving" ? saveStatusText.saving : save === "error" ? saveStatusText.error : settings.saved}
          </span>
        </>
      }
    >
      <Field label={settings.name} htmlFor="settings-name" hint={settings.nameNote}>
        <Input id="settings-name" shape="box" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <div className="flex flex-col gap-2">
        <label htmlFor="settings-slug" className="text-[15px] font-semibold">
          {settings.address}
        </label>
        <div className={problem ? "flex min-h-12 items-center overflow-hidden rounded-[10px] border-2 border-danger focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-slate" : "flex min-h-12 items-center overflow-hidden rounded-[10px] border border-ctrl focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-slate"}>
          <span className="whitespace-nowrap pl-3.5 text-[15px] text-mute">{settings.addressPrefix}</span>
          <input
            id="settings-slug"
            ref={slugInput}
            value={slug}
            disabled={checking}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            aria-invalid={problem ? true : undefined}
            aria-describedby="settings-slug-note"
            className="min-h-11 min-w-0 grow border-0 bg-transparent pl-0.5 pr-3.5 text-base text-slate outline-none"
          />
        </div>
        <div id="settings-slug-note">
          {problem ? (
            <FieldError>{problem}</FieldError>
          ) : checking ? (
            <span className="flex items-center gap-2 text-sm text-mute">
              <Spinner className="size-4" />
              {settings.addressChecking}
            </span>
          ) : slugState.status === "pending" ? (
            <FieldHint>{settings.addressPending}</FieldHint>
          ) : slugState.status === "ok" ? (
            <FieldHint>{settings.addressOk}</FieldHint>
          ) : (
            <FieldHint>{settings.addressNote}</FieldHint>
          )}
        </div>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3.5">
        <span>
          <span className="block text-base font-semibold">{settings.accepting}</span>
          <span className="mt-0.5 block text-sm text-mute">{settings.acceptingNote}</span>
        </span>
        <Switch checked={quiz.acceptingResponses} disabled={switching || !published} onCheckedChange={toggleAccepting} aria-label={settings.accepting} />
      </label>

      <div className="flex flex-col gap-2.5">
        <span className="text-[15px] font-semibold">{settings.colorsHeading}</span>
        <Locked title={settings.colors.title} note={settings.colors.note} />
      </div>
      <Locked title={settings.poweredBy.title} note={settings.poweredBy.note} />
    </Drawer>
  );
}

/** A feature that belongs to the Custom plan: shown dimmed, with a link to the plans. */
function Locked({ title, note }: { title: string; note: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-dashed border-dashline bg-dash px-4 py-3.5">
      <span className="grid size-10 flex-none place-items-center rounded-[10px] border border-line bg-white text-ink-2">
        <LockIcon size={20} />
      </span>
      <span className="min-w-0 grow">
        <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
          {title}
          <Link href={routes.pricing} className="rounded-full bg-slate px-2 py-0.5 text-xs font-semibold text-white no-underline">
            {settings.customPlan}
          </Link>
        </span>
        <span className="mt-0.5 block text-sm text-mute">{note}</span>
      </span>
    </div>
  );
}
