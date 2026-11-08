import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The plain bars of the Summary (board UINavigation, "Progress and charts"): one hue, and the value is always written next to the bar. */
export function BarRow({ label, value, shown, thin }: { label: ReactNode; value: number; shown: string; thin?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,170px)_minmax(0,1fr)_48px] items-center gap-3 text-[15px]">
      <span className="truncate">{label}</span>
      <span className={cn("block rounded-[7px] bg-soft", thin ? "h-3" : "h-3.5")} role="img" aria-label={`${label}: ${shown}`}>
        <span className={cn("block rounded-[7px] bg-bar", thin ? "h-3" : "h-3.5")} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </span>
      <span className="text-right font-semibold">{shown}</span>
    </div>
  );
}

/** A vertical bar with its number above it and its name below (the age brackets, the months). */
export function Columns({ bars }: { bars: { label: string; count: number; share: number }[] }) {
  return (
    <div>
      <div className="flex h-[130px] items-end gap-2.5 border-b border-line pt-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 text-xs text-mute">
            {bar.count}
            <i className="block w-full rounded-t-md bg-bar" style={{ height: `${bar.share}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2.5 text-xs text-mute">
        {bars.map((bar) => (
          <span key={bar.label} className="flex-1 text-center">
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatBox({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-xl bg-dash px-4 py-3.5">
      <b className="block text-[28px] font-extrabold leading-[34px] tracking-[-0.02em] text-ink">{value}</b>
      <span className="text-[13px] text-mute">{label}</span>
    </div>
  );
}
