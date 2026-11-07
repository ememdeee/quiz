"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { SectionHeading } from "./section-heading";

export type FaqItem = { readonly question: string; readonly answer: string };

function Question({ item, defaultOpen }: { item: FaqItem; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="rounded-2xl border border-line bg-white transition-colors duration-200 hover:border-line-strong">
      <h3 className="m-0">
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl px-[18px] py-[18px] text-left text-[17px] font-semibold leading-[1.35] transition-colors duration-200 hover:bg-page focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate sm:px-[22px] sm:text-lg"
        >
          {item.question}
          <ChevronDownIcon className={cn("flex-none transition-transform duration-300 ease-out", open && "rotate-180")} />
        </button>
      </h3>
      {/* The answer opens by growing from 0 to its own height: a plain CSS transition, no script per frame */}
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="m-0 px-[18px] pb-5 text-base leading-[26px] text-mute sm:px-[22px]">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

/** Questions and answers that open and close (the home and pricing pages share this). Full width of the page. */
export function FaqSection({
  eyebrow,
  title,
  items,
  size = "base",
}: {
  eyebrow: string;
  title: string;
  items: readonly FaqItem[];
  size?: "base" | "wide";
}) {
  return (
    <section className="pb-24 max-nav:pb-16">
      <Container size={size}>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-10 flex flex-col gap-3">
          {items.map((item, index) => (
            <Question key={item.question} item={item} defaultOpen={index === 0} />
          ))}
        </div>
      </Container>
    </section>
  );
}
