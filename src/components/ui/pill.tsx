import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  /** Open, Custom plan */
  solid: "border-transparent bg-slate text-white",
  /** Closed, Only some, Left at page 5 */
  neutral: "border-transparent bg-fill text-ink-2",
  /** Not published */
  outline: "border-ctrl bg-white text-ink-2",
  /** Verified */
  soft: "border-transparent bg-soft text-slate",
} as const;

/** A small label. Always has words, so color is never the only signal (board UIFeedback, "Labels"). */
export function Pill({ tone = "neutral", className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-[3px] text-[13px] font-semibold", tones[tone], className)}
      {...rest}
    />
  );
}
