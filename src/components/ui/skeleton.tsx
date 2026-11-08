import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** A grey block that stands where content will be (board Saving). Quietly pulses; stops with reduced motion. */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-hidden="true" className={cn("block animate-pulse rounded-lg bg-fill", className)} {...rest} />;
}
