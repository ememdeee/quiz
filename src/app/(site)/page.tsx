import type { Metadata } from "next";
import { CtaBand } from "@/components/layout/cta-band";
import { FaqSection } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/home/features";
import { HomeHero } from "@/components/marketing/home/hero";
import { HowItWorks } from "@/components/marketing/home/how-it-works";
import { Insights } from "@/components/marketing/home/insights";
import { PricingTeaser } from "@/components/marketing/home/pricing-teaser";
import { TagMarquee } from "@/components/marketing/home/tag-marquee";
import { home } from "@/content/home";
import { createQuizHref } from "@/lib/routes";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Quiz · Make a quiz people actually finish",
  description: "Build a quiz or survey with simple pages, share it with one link and see every answer. Free to start.",
};

export default async function HomePage() {
  const loggedIn = (await getSessionUser()) !== null;
  const createHref = createQuizHref(loggedIn);
  return (
    <>
      <HomeHero createHref={createHref} />
      <TagMarquee />
      <HowItWorks />
      <Features />
      <Insights />
      <PricingTeaser createHref={createHref} />
      <FaqSection eyebrow={home.faq.eyebrow} title={home.faq.title} items={home.faq.items} size="wide" />
      <CtaBand loggedIn={loggedIn} />
      <div className="h-24" />
    </>
  );
}
