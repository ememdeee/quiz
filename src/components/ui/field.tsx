import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircleIcon } from "./icons";

/** Text fields. An error shows three things together: a thicker red border, an icon and a message. */
const control =
  "w-full rounded-xl border border-ctrl bg-white text-[17px] text-ink placeholder:text-mute/80 " +
  "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate " +
  "aria-[invalid=true]:border-2 aria-[invalid=true]:border-danger disabled:opacity-50 transition-colors duration-200";

export function Input({ className, invalid, ...rest }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={cn(control, "min-h-14 px-4", className)} {...rest} />;
}

export function Textarea({ className, invalid, ...rest }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(control, "resize-none px-4 py-3.5 leading-[26px]", className)}
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
