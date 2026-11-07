import type { ReactNode } from "react";
import { CheckCircleGlyph, ClockGlyph, LockGlyph, MailGlyph } from "@/components/ui/icons";
import { auth } from "@/content/auth";
import { cn } from "@/lib/utils";

export type AuthPanelSpec =
  | { kind: "leave" }
  | { kind: "build" }
  | { kind: "glyph"; glyph: "lock" | "mail" | "check" | "clock"; caption: string };

const glyphs = { lock: <LockGlyph />, mail: <MailGlyph />, check: <CheckCircleGlyph />, clock: <ClockGlyph /> } satisfies Record<string, ReactNode>;

const glass = "border border-white/20 bg-white/10 backdrop-blur-sm";

function LeaveCard() {
  const { panel } = auth.login;
  return (
    <>
      <div aria-hidden="true" className={cn(glass, "relative w-[min(380px,100%)] animate-[float_6s_ease-in-out_infinite_alternate] rounded-[22px] p-6")}>
        <div className="mb-4 text-[15px] font-semibold">{panel.title}</div>
        {panel.rows.map((row, i, all) => (
          <div
            key={row.label}
            className="grid grid-cols-[90px_minmax(0,1fr)_40px] items-center gap-2.5 text-sm text-[#E1E8F2]"
            style={{ marginBottom: i === all.length - 1 ? 0 : 12 }}
          >
            <span>{row.label}</span>
            <span className="block h-2.5 rounded-md bg-white/20">
              <span className="block h-2.5 rounded-md bg-[#D6E0EF]" style={{ width: `${row.percent}%` }} />
            </span>
            <span>{row.percent}%</span>
          </div>
        ))}
      </div>
      <div className="relative mt-7 max-w-[360px] text-center text-[26px] font-extrabold leading-8 tracking-[-0.02em]">{panel.caption}</div>
    </>
  );
}

function BuildChips() {
  const { panel } = auth.register;
  return (
    <div className="relative flex flex-col items-start gap-[18px]">
      <h2 className="m-0 mb-3 text-[40px] font-extrabold leading-[46px] tracking-[-0.03em]">
        {panel.title[0]}
        <br />
        {panel.title[1]}
      </h2>
      {panel.chips.map((chip, i) => (
        <span
          key={chip}
          aria-hidden="true"
          className={cn(glass, "inline-flex animate-[float_5s_ease-in-out_infinite_alternate] items-center gap-2.5 rounded-2xl px-[18px] py-3 text-base font-semibold")}
          style={{ marginLeft: i * 36, animationDelay: `${-1.5 * i}s` }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

/** The dark panel on the right of every sign-in screen. It is hidden below 900 px. */
export function AuthPanel({ spec }: { spec: AuthPanelSpec }) {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#3B4A60,#1E293B)] p-16 text-white max-nav:hidden">
      <div aria-hidden="true" className="orb -left-30 -top-30 size-[420px]" style={{ background: "radial-gradient(circle, #6E86AB, transparent 70%)" }} />
      <div
        aria-hidden="true"
        className="orb -bottom-30 -right-25 size-[420px]"
        style={{ background: "radial-gradient(circle, #50678A, transparent 70%)", animationDelay: "-8s" }}
      />
      {spec.kind === "leave" ? <LeaveCard /> : null}
      {spec.kind === "build" ? <BuildChips /> : null}
      {spec.kind === "glyph" ? (
        <>
          <div aria-hidden="true" className={cn(glass, "relative grid size-[150px] animate-[float_5s_ease-in-out_infinite_alternate] place-items-center rounded-[40px]")}>
            {glyphs[spec.glyph]}
          </div>
          <div className="relative mt-9 max-w-[360px] text-center text-3xl font-extrabold leading-9 tracking-[-0.02em]">{spec.caption}</div>
        </>
      ) : null}
    </div>
  );
}
