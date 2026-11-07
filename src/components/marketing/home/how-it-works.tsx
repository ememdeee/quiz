import type { CSSProperties } from "react";
import { Card, StepNumber } from "@/components/ui/card";
import { home } from "@/content/home";
import { cn } from "@/lib/utils";
import { Container } from "../container";
import { SectionHeading } from "../section-heading";

const mini = "mt-[22px] flex h-[132px] flex-col justify-center gap-2 overflow-hidden rounded-[14px] border border-line bg-page p-3.5";
const bars = [
  { h: "55%", d: "0s" },
  { h: "80%", d: "-.6s" },
  { h: "40%", d: "-1.2s" },
  { h: "95%", d: "-1.8s" },
  { h: "65%", d: "-2.4s" },
  { h: "75%", d: "-3s" },
];

function BuildPreview() {
  return (
    <div className={mini} aria-hidden="true">
      {home.how.buildRows.map((row, i) => (
        <div
          key={row}
          className="flex h-[26px] animate-[rowhi_4.5s_infinite] items-center rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-slate"
          style={{ animationDelay: `${i * 1.5}s` }}
        >
          {row}
        </div>
      ))}
    </div>
  );
}

function SharePreview() {
  return (
    <div className={cn(mini, "items-stretch gap-5")} aria-hidden="true">
      <div className="flex h-[34px] items-center rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-mute">
        {home.how.sampleLink}
      </div>
      <span className="inline-flex min-h-9 animate-[nudge_3s_ease-in-out_infinite] items-center gap-2 self-center rounded-full bg-slate px-3.5 text-[13px] font-semibold text-white">
        {home.how.copyLink}
      </span>
    </div>
  );
}

function AnswersPreview() {
  return (
    <div className={mini} aria-hidden="true">
      <div className="flex h-full items-end gap-2">
        {bars.map((bar) => (
          <i
            key={bar.h + bar.d}
            className="flex-1 origin-bottom animate-[grow_3.6s_ease-in-out_infinite_alternate] rounded-t-md bg-bar-soft"
            style={{ height: bar.h, animationDelay: bar.d } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

const previews = [BuildPreview, SharePreview, AnswersPreview];

export function HowItWorks() {
  const { how } = home;
  return (
    <section id="how" className="scroll-mt-24 py-24 max-nav:py-16">
      <Container size="wide">
        <SectionHeading eyebrow={how.eyebrow} title={how.title} sub={how.sub} />
        <div className="mt-12 grid gap-6 nav:grid-cols-3">
          {how.steps.map((step, i) => {
            const Preview = previews[i];
            return (
              <Card key={step.title} className="scroll-rise">
                <StepNumber>{i + 1}</StepNumber>
                <h3 className="mb-1.5 mt-[18px] text-[21px] font-bold tracking-[-0.01em]">{step.title}</h3>
                <p className="m-0 text-base leading-[25px] text-mute">{step.text}</p>
                <Preview />
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
