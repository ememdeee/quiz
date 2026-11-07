import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircleIcon } from "./icons";

const tone = {
  error: "border-danger-line bg-danger-soft text-danger-ink",
  info: "border-line bg-soft text-ink",
} as const;

/** A message that sits above a form: red for something wrong, grey for good-to-know. */
export function Banner({
  tone: variant = "info",
  className,
  style,
  children,
}: {
  tone?: keyof typeof tone;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      style={style}
      className={cn("flex animate-[appear_0.25s_ease-out] items-start gap-3 rounded-[14px] border px-4 py-3.5 text-[15px] leading-[22px]", tone[variant], className)}
    >
      <AlertCircleIcon className="mt-px flex-none" />
      <span>{children}</span>
    </div>
  );
}
