import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A dashed card that says there is nothing here yet and what to do about it (board Empty). */
export function EmptyState({
  icon,
  title,
  action,
  className,
  children,
}: {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3.5 rounded-2xl border border-dashed border-dashline bg-white px-7 py-10 text-center", className)}>
      {icon ? <span className="grid size-14 place-items-center rounded-2xl bg-soft text-slate">{icon}</span> : null}
      <h2 className="m-0 text-xl font-bold text-ink">{title}</h2>
      <p className="m-0 text-base leading-6 text-ink-2">{children}</p>
      {action}
    </div>
  );
}
