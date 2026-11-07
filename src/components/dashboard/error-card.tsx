import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A centred white card for "we couldn't load this" and "we can't find this" (board DashErrors). */
export function ErrorCard({
  icon,
  title,
  action,
  className,
  children,
}: {
  icon?: ReactNode;
  title: string;
  action: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-white px-6 py-8 text-center", className)}>
      {icon ? <span className="grid size-[52px] place-items-center rounded-full bg-soft text-slate">{icon}</span> : null}
      <h2 className="m-0 text-xl font-bold leading-7 text-ink">{title}</h2>
      <p className="m-0 text-[15px] leading-[23px] text-ink-2">{children}</p>
      <div className="mt-1.5">{action}</div>
    </div>
  );
}
