"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Radio, RadioCard, RadioGroup } from "@/components/ui/controls";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { newQuizDialog } from "@/content/dashboard/quizzes";
import { quizTemplates } from "@/data/mock/templates";
import type { QuizStart, QuizSummary } from "@/lib/quizzes/types";
import { cn } from "@/lib/utils";

type Kind = QuizStart["kind"];

/** "Create a new quiz" (boards NewQuiz and TemplateContents): a name, and what to start from. */
export function NewQuizDialog({
  quizzes,
  onCreate,
  onClose,
}: {
  quizzes: readonly QuizSummary[];
  onCreate: (input: { name: string; from: QuizStart }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("blank");
  const [templateId, setTemplateId] = useState(quizTemplates[0].id);
  const [copyId, setCopyId] = useState(quizzes[0]?.id ?? "");
  const [pending, setPending] = useState(false);

  const from: QuizStart = kind === "template" ? { kind, templateId } : kind === "copy" ? { kind, quizId: copyId } : { kind };
  const canCreate = name.trim() !== "" && !pending;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canCreate) return;
    setPending(true);
    await onCreate({ name, from });
    setPending(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={newQuizDialog.title} className="max-w-[600px] gap-[22px] p-8">
      <form onSubmit={submit} className="flex flex-col gap-[22px]">
        <Field label={newQuizDialog.nameLabel} htmlFor="new-quiz-name">
          <Input
            id="new-quiz-name"
            shape="box"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={newQuizDialog.namePlaceholder}
            className="min-h-[52px]"
            autoFocus
          />
        </Field>

        <div role="group" aria-labelledby="start-from" className="flex flex-col gap-2.5">
          <span id="start-from" className="text-[15px] font-semibold">
            {newQuizDialog.startFrom}
          </span>
          <RadioGroup value={kind} onValueChange={(value) => setKind(value as Kind)} className="flex flex-col gap-2.5">
            <Row id="start-blank" value="blank" selected={kind === "blank"} title={newQuizDialog.blank.title} text={newQuizDialog.blank.text} />
            <Row id="start-template" value="template" selected={kind === "template"} title={newQuizDialog.template.title} text={newQuizDialog.template.text}>
              <RadioGroup value={templateId} onValueChange={setTemplateId} className="grid grid-cols-3 gap-2.5" aria-label={newQuizDialog.template.title}>
                {quizTemplates.map((template) => (
                  <RadioCard key={template.id} value={template.id}>
                    <span className="text-[15px] font-semibold">{template.name}</span>
                    <span className="text-sm text-mute">{template.summary}</span>
                  </RadioCard>
                ))}
              </RadioGroup>
            </Row>
            <Row
              id="start-copy"
              value="copy"
              selected={kind === "copy"}
              disabled={quizzes.length === 0}
              title={newQuizDialog.copy.title}
              text={newQuizDialog.copy.text}
            >
              <Select aria-label={newQuizDialog.copy.pick} value={copyId} onChange={(e) => setCopyId(e.target.value)}>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.name}
                  </option>
                ))}
              </Select>
            </Row>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-3">
          <Button shape="box" variant="secondary" onClick={onClose}>
            {newQuizDialog.cancel}
          </Button>
          <Button shape="box" type="submit" disabled={!canCreate} loading={pending} className="px-[26px]">
            {newQuizDialog.create}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** One "Start from" choice. When it is chosen, its own options open underneath. */
function Row({
  id,
  value,
  selected,
  disabled,
  title,
  text,
  children,
}: {
  id: string;
  value: Kind;
  selected: boolean;
  disabled?: boolean;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl px-3.5 py-2.5", selected ? "border-2 border-slate bg-soft px-[13px] py-[9px]" : "border border-line", disabled && "opacity-50")}>
      <div className="flex min-h-11 items-center gap-3">
        <Radio id={id} value={value} disabled={disabled} />
        <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer py-1">
          <span className="block text-base font-semibold">{title}</span>
          <span className="mt-0.5 block text-sm text-mute">{text}</span>
        </label>
      </div>
      {selected ? children : null}
    </div>
  );
}
