"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Segmented, Switch } from "@/components/ui/controls";
import { Input, Select } from "@/components/ui/field";
import { ChevronDownIcon, ChevronRightIcon, CloseIcon, PlusIcon } from "@/components/ui/icons";
import { conditions } from "@/content/dashboard/conditions";
import { defaultRule, describeShowRule, opsFor, ruleSources } from "@/lib/quiz/conditions";
import { pageTypes } from "@/lib/quiz/page-types";
import { MAX_RULES, type Page, type Rule } from "@/lib/quiz/schema";
import { useEditor, useEditorActions } from "../editor-context";

const matchOptions = [
  { value: "all", label: conditions.all },
  { value: "any", label: conditions.any },
] as const;

/** "Display conditions" at the bottom of a page panel (board Conditions): who gets to see this page. */
export function ConditionsSection({ page }: { page: Page }) {
  const doc = useEditor((s) => s.doc);
  const { edit } = useEditorActions();
  const [expanded, setExpanded] = useState(true);
  const sources = ruleSources(doc, page.id);
  const show = page.show;
  const on = show !== undefined;

  const change = (recipe: (show: { match: "all" | "any"; rules: Rule[] }) => void) =>
    edit(page.id, (draft) => {
      if (draft.show) recipe(draft.show as { match: "all" | "any"; rules: Rule[] });
    });

  const toggle = (checked: boolean) => {
    setExpanded(true);
    if (!checked) return edit(page.id, (draft) => void delete draft.show);
    const nearest = sources[sources.length - 1];
    if (nearest) edit(page.id, (draft) => void (draft.show = { match: "all", rules: [defaultRule(nearest)] }));
  };

  const setSource = (index: number, sourceId: string) => {
    const source = sources.find((s) => s.id === sourceId);
    if (source) change((s) => void (s.rules[index] = defaultRule(source)));
  };

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border border-line p-4">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={on && expanded}
          disabled={!on}
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-2 rounded-md text-base font-bold focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
        >
          {on && expanded ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />}
          {conditions.title}
        </button>
        <Switch aria-label={conditions.title} checked={on} disabled={!on && sources.length === 0} onCheckedChange={toggle} />
      </div>

      {!on ? <p className="m-0 text-sm leading-5 text-mute">{sources.length === 0 ? conditions.noSource : conditions.off}</p> : null}

      {show && expanded ? (
        <div className="flex flex-col gap-3.5 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-2.5 text-[15px] font-bold">
            <span>{conditions.showWhen}</span>
            {show.rules.length > 1 ? (
              <>
                <Segmented aria-label={conditions.showWhen} value={show.match} options={matchOptions} onValueChange={(match) => change((s) => void (s.match = match as "all" | "any"))} />
                <span>{conditions.ofThese}</span>
              </>
            ) : null}
          </div>

          {show.rules.map((rule, index) => {
            const source = doc.pages.find((p) => p.id === rule.page);
            return (
              <div key={index} className="flex flex-col gap-3.5">
                {index > 0 ? (
                  <div className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.06em] text-mute" aria-hidden="true">
                    <span className="h-px flex-1 bg-line" />
                    {show.match === "all" ? conditions.and : conditions.or}
                    <span className="h-px flex-1 bg-line" />
                  </div>
                ) : null}
                <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-dash p-3.5">
                  <div className="flex items-center gap-2.5">
                    <Select aria-label={conditions.question} value={rule.page} onChange={(e) => setSource(index, e.target.value)}>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {doc.pages.indexOf(s) + 1}. {pageTypes[s.type].title(s as never)}
                        </option>
                      ))}
                    </Select>
                    {show.rules.length > 1 ? (
                      <Button shape="box" variant="secondary" aria-label={conditions.remove} onClick={() => change((s) => void s.rules.splice(index, 1))} className="size-11 flex-none px-0 text-mute">
                        <CloseIcon size={16} />
                      </Button>
                    ) : null}
                  </div>
                  {source ? (
                    <Select aria-label={conditions.comparison} value={rule.op} onChange={(e) => change((s) => void (s.rules[index].op = e.target.value as Rule["op"]))}>
                      {opsFor(source).map((op) => (
                        <option key={op} value={op}>
                          {conditions.ops[op]}
                        </option>
                      ))}
                    </Select>
                  ) : null}
                  {source?.type === "choice" ? (
                    <Select aria-label={conditions.value} value={String(rule.value)} onChange={(e) => change((s) => void (s.rules[index].value = e.target.value))}>
                      {source.answers.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.text}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      shape="box"
                      type="number"
                      aria-label={conditions.value}
                      value={String(rule.value)}
                      onChange={(e) => change((s) => void (s.rules[index].value = e.target.value === "" ? 0 : Number(e.target.value)))}
                    />
                  )}
                </div>
              </div>
            );
          })}

          <Button
            shape="box"
            size="sm"
            variant="ghost"
            disabled={show.rules.length >= MAX_RULES}
            onClick={() => change((s) => void s.rules.push(defaultRule(sources[sources.length - 1])))}
            className="self-start bg-soft"
          >
            <PlusIcon size={16} />
            {conditions.add}
          </Button>

          <p className="m-0 rounded-[10px] bg-soft px-3.5 py-3 text-[15px] leading-[23px] text-ink">
            <strong>{conditions.plain}</strong> {describeShowRule(doc, page)}
          </p>
        </div>
      ) : null}
    </section>
  );
}
