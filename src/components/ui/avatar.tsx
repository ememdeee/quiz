import { cn } from "@/lib/utils";
import { UserIcon } from "./icons";

/** The round person icon (account button and the top of the account menu). */
export function Avatar({ tone = "soft", className }: { tone?: "soft" | "slate"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-11 flex-none place-items-center rounded-full",
        tone === "soft" ? "border border-line bg-soft text-slate" : "bg-slate text-white",
        className,
      )}
    >
      <UserIcon />
    </span>
  );
}
