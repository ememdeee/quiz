import type { CSSProperties } from "react";
import { home } from "@/content/home";
import { Container } from "../container";
import { SectionHeading } from "../section-heading";

/** Dark band: counters on the left, a "where people leave" chart on the right. */
export function Insights() {
  const { insights } = home;
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white max-nav:py-16">
      <div aria-hidden="true" className="orb -left-30 -top-35 size-[460px]" style={{ background: "radial-gradient(circle, var(--color-orb-c), transparent 70%)" }} />
      <div
        aria-hidden="true"
        className="orb -bottom-40 -right-25 size-[420px]"
        style={{ background: "radial-gradient(circle, var(--color-orb-d), transparent 70%)", animationDelay: "-6s" }}
      />
      <Container size="wide">
        <div className="relative grid items-center gap-14 nav:grid-cols-2">
          <div>
            <SectionHeading eyebrow={insights.eyebrow} title={insights.title} sub={insights.sub} tone="dark" />
            <div className="mt-[34px] flex flex-wrap gap-9 max-nav:gap-[26px]">
              {insights.stats.map((stat) => (
                <div key={stat.label}>
                  <b className="block text-5xl font-extrabold leading-[54px] tracking-[-0.03em]">
                    <span className="count-up" style={{ "--t": stat.value } as CSSProperties} />
                  </b>
                  <span className="text-[15px] text-on-dark-3">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div aria-hidden="true" className="scroll-rise rounded-[22px] border border-night-line bg-night-card p-7">
            {insights.bars.map((bar, i, all) => (
              <div
                key={bar.label}
                className="grid grid-cols-[84px_minmax(0,1fr)_40px] items-center gap-3 text-sm text-on-dark-4 nav:grid-cols-[110px_minmax(0,1fr)_44px]"
                style={{ marginBottom: i === all.length - 1 ? 0 : 14 }}
              >
                <span>{bar.label}</span>
                <span className="block h-3 overflow-hidden rounded-[7px] bg-night-line">
                  <i
                    className="block h-3 origin-left animate-[growx_5s_ease-in-out_infinite_alternate] rounded-[7px] bg-tint"
                    style={{ width: `${bar.percent}%`, animationDelay: `${-0.5 * i}s` }}
                  />
                </span>
                <span>{bar.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
