import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Page width with side padding. "wide" is the home page, "base" everything else. */
export function Container({ size = "base", className, ...rest }: HTMLAttributes<HTMLDivElement> & { size?: "base" | "wide" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        size === "wide" ? "max-w-[1160px] px-5 sm:px-8" : "max-w-[1096px] px-[18px] sm:px-6",
        className,
      )}
      {...rest}
    />
  );
}
