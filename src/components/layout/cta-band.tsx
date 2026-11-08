import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ctaBand } from "@/content/site";
import { createQuizHref } from "@/lib/routes";

/** Dark closing band with one button (boards CtaBand and CtaBandMobile). */
export function CtaBand({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <div className="px-6">
      <div className="relative mx-auto max-w-[1096px] overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,var(--color-night),var(--color-ink))] px-7 py-18 text-center text-white max-nav:rounded-[26px] max-nav:py-12">
        <div aria-hidden="true" className="orb -left-20 -top-30 size-[360px]" style={{ background: "radial-gradient(circle, var(--color-orb-a), transparent 70%)" }} />
        <div
          aria-hidden="true"
          className="orb -bottom-35 -right-20 size-[360px]"
          style={{ background: "radial-gradient(circle, var(--color-orb-b), transparent 70%)", animationDelay: "-8s" }}
        />
        <div className="relative">
          <h2 className="m-0 text-[clamp(30px,5vw,52px)] font-extrabold leading-[1.08] tracking-[-0.03em]">
            {ctaBand.title[0]}
            <br />
            {ctaBand.title[1]}
          </h2>
          <p className="mx-auto mb-[30px] mt-3.5 max-w-[520px] text-lg leading-7 text-on-dark-2">{ctaBand.text}</p>
          <ButtonLink href={createQuizHref(loggedIn)} variant="light" size="lg" className="px-8 text-[17px]">
            {ctaBand.button}
            <ArrowRightIcon />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
