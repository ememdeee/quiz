import { ProgressBar } from "@/components/ui/progress-bar";
import { textLink } from "@/components/ui/link-styles";
import { usageMeter } from "@/content/dashboard/quizzes";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";

/** "Quizzes 3 of 5 used" with a bar and a link to the plans (board LimitStates, "Usage"). */
export function UsageMeter({ used, max, planLabel, className }: { used: number; max: number; planLabel: string; className?: string }) {
  const words = usageMeter.quizzes;
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex justify-between text-[15px]">
        <span className="font-semibold">{words.label}</span>
        <span className="text-mute">{words.used(used, max)}</span>
      </div>
      <ProgressBar value={used} max={max} label={words.label} />
      <span className="text-[13px] text-mute">
        {words.plan(planLabel)}{" "}
        <Link href={routes.pricing} className={cn("font-semibold text-slate", textLink)}>
          {words.seePlans}
        </Link>
      </span>
    </div>
  );
}
