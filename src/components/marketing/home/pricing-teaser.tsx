import { ButtonLink } from "@/components/ui/button";
import { home } from "@/content/home";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { Container } from "../container";
import { SectionHeading } from "../section-heading";

const plan =
  "lift scroll-rise flex flex-col gap-3 rounded-[22px] border bg-white p-[30px]";

export function PricingTeaser({ createHref }: { createHref: string }) {
  const { pricingTeaser: t } = home;
  return (
    <section className="py-24 max-nav:py-16">
      <Container size="wide">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} sub={t.sub} />
        <div className="mt-12 grid max-w-[880px] gap-6 nav:grid-cols-2">
          <div className={cn(plan, "border-line")}>
            <h3 className="m-0 text-[22px] font-bold">{t.free.name}</h3>
            <div className="text-[40px] font-extrabold leading-[48px] tracking-[-0.03em]">{t.free.price}</div>
            <p className="m-0 text-base leading-[25px] text-mute">{t.free.text}</p>
            <ButtonLink href={createHref} variant="secondary" className="mt-2.5">
              {t.free.cta}
            </ButtonLink>
          </div>
          <div className={cn(plan, "border-2 border-slate")}>
            <h3 className="m-0 text-[22px] font-bold">{t.custom.name}</h3>
            <div className="text-[30px] font-extrabold leading-[48px] tracking-[-0.03em]">{t.custom.price}</div>
            <p className="m-0 text-base leading-[25px] text-mute">{t.custom.text}</p>
            <ButtonLink href={routes.pricing} className="mt-2.5">
              {t.custom.cta}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
