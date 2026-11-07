import { cn } from "@/lib/utils";

/** A thin bar for "3 of 5 used". The number is always written next to it (board UINavigation). */
export function ProgressBar({
  value,
  max,
  label,
  size = "md",
  className,
}: {
  value: number;
  max: number;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("overflow-hidden rounded-full bg-line", size === "sm" ? "h-1.5" : "h-2", className)}
    >
      <div className="h-full rounded-full bg-slate" style={{ width: `${percent}%` }} />
    </div>
  );
}
