import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** White card with a line border. Lifts a little on hover (website only), smooth and without flicker. */
export function Card({ className, lift = true, ...rest }: HTMLAttributes<HTMLDivElement> & { lift?: boolean }) {
  return <div className={cn("rounded-[22px] border border-line bg-white p-7", lift && "lift", className)} {...rest} />;
}

/** Rounded square that holds an icon at the top of a card. */
export function IconBadge({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("grid size-[46px] place-items-center rounded-[14px] bg-soft text-slate", className)} {...rest} />;
}

/** Numbered dot used for steps. */
export function StepNumber({ className, size = "md", ...rest }: HTMLAttributes<HTMLSpanElement> & { size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "grid flex-none place-items-center rounded-full bg-slate font-bold text-white",
        size === "md" ? "size-9 text-[15px]" : "size-8 text-sm",
        className,
      )}
      {...rest}
    />
  );
}
