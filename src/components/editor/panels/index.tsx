"use client";

import type { ComponentType } from "react";
import { panel } from "@/content/dashboard/editor";
import { pageTypes } from "@/lib/quiz/page-types";
import type { Page, PageOf, PageType } from "@/lib/quiz/schema";
import { ConditionsSection } from "./conditions-section";
import { ChoicePanel } from "./choice-panel";
import { EndPanel, LoadingPanel } from "./loading-end-panels";
import { NumberPanel } from "./number-panel";
import { InfoPanel, TextPanel, WelcomePanel } from "./simple-panels";

const panels: { [T in PageType]: ComponentType<{ page: PageOf<T> }> } = {
  welcome: WelcomePanel,
  choice: ChoicePanel,
  text: TextPanel,
  number: NumberPanel,
  info: InfoPanel,
  loading: LoadingPanel,
  end: EndPanel,
};

/** The right-hand "Edit page N" panel: its heading, then the fields of that kind of page. */
export function PagePanel({ page, position }: { page: Page; position: number }) {
  const Fields = panels[page.type] as ComponentType<{ page: Page }>;
  return (
    <section className="flex min-w-0 flex-1 basis-[340px] flex-col gap-[22px] self-start rounded-2xl border border-line bg-white p-6 lg:max-w-[400px]">
      <div>
        <h2 className="m-0 text-lg font-bold">{page.type === "end" ? panel.titleLast : panel.title(position)}</h2>
        <span className="text-sm text-mute">{pageTypes[page.type].label}</span>
      </div>
      <Fields key={page.id} page={page} />
      {page.type === "welcome" || page.type === "end" ? null : <ConditionsSection key={`${page.id}-show`} page={page} />}
    </section>
  );
}
