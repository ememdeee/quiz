import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { pricing } from "@/content/pricing";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

const card =
  "lift flex min-w-0 flex-[1_1_360px] flex-col gap-5 rounded-3xl border bg-white p-8 max-[700px]:p-6";

function Feature({ dark, children }: { dark?: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-base leading-6">
      <span className={cn("grid size-6 flex-none place-items-center rounded-full", dark ? "bg-slate text-white" : "bg-soft text-slate")}>
        <CheckIcon size={14} />
      </span>
      {children}
    </li>
  );
}

/** The two plan cards: Free and Custom. */
export function Plans({ createHref }: { createHref: string }) {
  const { free, custom } = pricing;
  return (
    <div className="enter relative mt-12 flex flex-wrap items-stretch gap-6 text-left" style={{ "--d": "320ms" } as React.CSSProperties}>
      <section className={cn(card, "border-line")}>
        <div>
          <h2 className="m-0 text-[22px] font-bold">{free.name}</h2>
          <p className="mb-0 mt-1.5 text-base text-mute">{free.text}</p>
        </div>
        <div className="text-[44px] font-extrabold leading-[52px] tracking-[-0.03em]">{free.price}</div>
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {free.features.map((feature) => (
            <Feature key={feature}>{feature}</Feature>
          ))}
          <li className="flex items-start gap-3 text-base leading-6 text-mute">{free.note}</li>
        </ul>
        <ButtonLink href={createHref} variant="secondary" className="mt-auto">
          {free.cta}
        </ButtonLink>
      </section>

      <section className={cn(card, "border-2 border-slate")}>
        <div>
          <span className="inline-flex rounded-full bg-slate px-3 py-1 text-[13px] font-bold text-white">{custom.badge}</span>
          <h2 className="mb-0 mt-3.5 text-[22px] font-bold">{custom.name}</h2>
          <p className="mb-0 mt-1.5 text-base text-mute">{custom.text}</p>
        </div>
        <div>
          <div className="text-[32px] font-extrabold leading-[52px] tracking-[-0.03em]">{custom.price}</div>
          <div className="mt-0.5 text-[15px] text-mute">{custom.priceNote}</div>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          <li className="text-base font-semibold leading-6">{custom.lead}</li>
          {custom.features.map((feature) => (
            <Feature key={feature} dark>
              {feature}
            </Feature>
          ))}
        </ul>
        <ButtonLink href={routes.contact} className="mt-auto">
          {custom.cta}
          <ArrowRightIcon />
        </ButtonLink>
      </section>
    </div>
  );
}
