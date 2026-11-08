import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircleIcon } from "./icons";

/** Text fields. An error shows three things together: a thicker red border, an icon and a message. */
const control =
  "w-full rounded-xl border border-ctrl bg-white text-[17px] text-ink placeholder:text-mute/80 " +
  "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate " +
  "aria-[invalid=true]:border-2 aria-[invalid=true]:border-danger disabled:opacity-50 transition-colors duration-200";

/** shape="pill" is the website (taller, 12 px corners); shape="box" is the dashboard (48 px, 10 px corners). */
type Shape = "pill" | "box";
type FieldProps = { invalid?: boolean; shape?: Shape };

const box = "rounded-[10px] text-base disabled:border-line disabled:bg-dash disabled:text-ctrl disabled:opacity-100";
const height = { pill: "min-h-14 px-4", box: cn("min-h-12 px-3.5", box) } as const;

export function Input({ className, invalid, shape = "pill", ...rest }: ComponentProps<"input"> & FieldProps) {
  return <input aria-invalid={invalid || undefined} className={cn(control, height[shape], className)} {...rest} />;
}

export function Select({ className, invalid, shape = "box", ...rest }: ComponentProps<"select"> & FieldProps) {
  return <select aria-invalid={invalid || undefined} className={cn(control, height[shape], "text-[15px]", className)} {...rest} />;
}

export function Textarea({ className, invalid, shape = "pill", ...rest }: ComponentProps<"textarea"> & FieldProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(control, "resize-none", shape === "box" ? cn(box, "px-3.5 py-3 leading-6") : "px-4 py-3.5 leading-[26px]", className)}
      {...rest}
    />
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <span id={id} role="alert" className="flex animate-[appear_0.25s_ease-out] items-center gap-1.5 text-sm text-danger">
      <AlertCircleIcon size={16} />
      {children}
    </span>
  );
}

export function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <span id={id} className="text-sm text-mute">
      {children}
    </span>
  );
}

/** Label + control + hint + error stacked the same way everywhere. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-[15px] font-semibold">
        {label}
      </label>
      {children}
      {error ? <FieldError id={`${htmlFor}-error`}>{error}</FieldError> : null}
      {!error && hint ? <FieldHint id={`${htmlFor}-hint`}>{hint}</FieldHint> : null}
    </div>
  );
}
