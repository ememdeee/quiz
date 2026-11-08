import { saveStatusText } from "@/content/dashboard/common";
import { cn } from "@/lib/utils";
import { Button, Spinner } from "./button";
import { AlertCircleIcon, CheckIcon } from "./icons";

export type SaveState = "saving" | "saved" | "error";

/** The line next to the quiz name in the editor (board Saving). The editor slice puts it in the header. */
export function SaveStatus({ state, onRetry, className }: { state: SaveState; onRetry?: () => void; className?: string }) {
  const isError = state === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-[15px]",
        isError ? "border-2 border-danger text-danger" : "border-line",
        className,
      )}
    >
      {state === "saving" ? <Spinner className="text-slate" /> : isError ? <AlertCircleIcon /> : <CheckIcon size={18} />}
      <span className="grow">{saveStatusText[state]}</span>
      {isError && onRetry ? (
        <Button shape="box" size="sm" variant="danger-quiet" onClick={onRetry}>
          {saveStatusText.retry}
        </Button>
      ) : null}
    </div>
  );
}
