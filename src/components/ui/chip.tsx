import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** A pill that can be switched on and off (for example "What do you need?" on the contact form). */
export function ToggleChip({
  pressed,
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { pressed: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(
        "lift inline-flex min-h-11 items-center gap-2 rounded-full border px-[18px] text-[15px] [--lift-shadow:none] [--lift:2px]",
        "transition-[translate,background-color,border-color,color] duration-200",
        "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate",
        pressed ? "border-slate bg-slate font-semibold text-white" : "border-line-strong bg-white font-medium text-slate hover:bg-dash",
        className,
      )}
      {...rest}
    />
  );
}
