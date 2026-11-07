import type { Metadata } from "next";
import { CtaBand } from "@/components/layout/cta-band";
import { FaqSection } from "@/components/marketing/faq";
import { Container } from "@/components/marketing/container";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { CompareTable } from "@/components/marketing/pricing/compare-table";
import { CustomSteps } from "@/components/marketing/pricing/custom-steps";
import { Plans } from "@/components/marketing/pricing/plans";
import { pricing } from "@/content/pricing";
import { createQuizHref } from "@/lib/routes";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Pricing · Quiz",
  description: "Quiz is free to start. Want your own brand and domain? We’ll build a custom quiz page with you.",
};

export default async function PricingPage() {
  const loggedIn = (await getSessionUser()) !== null;
  const { hero } = pricing;
  return (
    <>
      <header className="relative pb-2 pt-11 text-center sm:pt-[72px]">
        <HeroBackdrop />
        <Container className="relative">
          <span className="enter text-sm font-bold uppercase tracking-[0.06em] text-mute" style={{ "--d": "40ms" } as React.CSSProperties}>
            {hero.eyebrow}
          </span>
          <h1
            className="enter mt-3.5 text-[clamp(34px,5vw,60px)] font-extrabold leading-[1.06] tracking-[-0.035em]"
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            {hero.titleLines[0]}
            <br />
            {hero.titleLines[1]}
          </h1>
          <p
            className="enter mx-auto mt-[18px] max-w-[560px] text-[19px] leading-[29px] text-mute max-[700px]:text-[17px] max-[700px]:leading-[27px]"
            style={{ "--d": "220ms" } as React.CSSProperties}
          >
            {hero.lede}
          </p>
          <Plans createHref={createQuizHref(loggedIn)} />
        </Container>
      </header>
      <CompareTable />
      <CustomSteps />
      <FaqSection eyebrow={pricing.faq.eyebrow} title={pricing.faq.title} items={pricing.faq.items} />
      <CtaBand loggedIn={loggedIn} />
      <div className="h-24" />
    </>
  );
}
