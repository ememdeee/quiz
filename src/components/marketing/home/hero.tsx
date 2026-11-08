import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { home } from "@/content/home";
import { Container } from "../container";
import { HeroBackdrop } from "../hero-backdrop";
import { PhoneDemo } from "./phone-demo";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function HomeHero({ createHref }: { createHref: string }) {
  const { hero } = home;
  return (
    <header className="relative pb-14 pt-11 sm:pt-[72px]">
      <HeroBackdrop
        dotsAt="70% 40%"
        blobA={{ width: 440, height: 440, left: -140, top: -120 }}
        blobB={{ width: 520, height: 520, right: -160, top: 60, animationDuration: "22s" }}
      />
      <Container size="wide">
        <div className="relative grid items-center gap-12 nav:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span
              className="enter inline-flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2 pr-3.5 text-sm font-semibold text-slate"
              style={delay(40)}
            >
              <b className="inline-grid place-items-center rounded-full bg-slate px-2 py-0.5 text-xs text-white">{hero.badge}</b>
              {hero.badgeText}
            </span>

            <h1
              className="enter mt-[22px] text-[clamp(40px,5.4vw,68px)] font-extrabold leading-[1.04] tracking-[-0.035em]"
              style={delay(140)}
            >
              {hero.titleStart}{" "}
              <span className="inline-block h-[1.04em] w-[3.9em] overflow-hidden align-bottom text-slate">
                <span className="block animate-[rotate-words_9s_cubic-bezier(.7,0,.2,1)_infinite]">
                  {hero.rotatingWords.map((word, i) => (
                    <em key={i} className="block h-[1.04em] not-italic" aria-hidden={i > 0 || undefined}>
                      {word}
                    </em>
                  ))}
                </span>
              </span>
              <br />
              <span className="hl-mark">{hero.titleHighlight}</span>
            </h1>

            <p className="enter mt-[22px] max-w-[520px] text-xl leading-[30px] text-mute" style={delay(320)}>
              {hero.lede}
            </p>

            <div className="enter mt-8 flex flex-wrap gap-3" style={delay(440)}>
              <ButtonLink href={createHref}>
                {hero.primary}
                <ArrowRightIcon />
              </ButtonLink>
              <ButtonLink href="#how" variant="secondary">
                {hero.secondary}
              </ButtonLink>
            </div>

            <ul className="enter mt-[26px] flex flex-wrap gap-x-[22px] gap-y-2 text-[15px] text-mute" style={delay(560)}>
              {hero.trust.map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <CheckIcon size={18} className="text-slate" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <PhoneDemo />
        </div>
      </Container>
    </header>
  );
}
