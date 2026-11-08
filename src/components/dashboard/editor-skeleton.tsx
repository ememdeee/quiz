import { Skeleton } from "@/components/ui/skeleton";
import { dashLabels } from "@/content/dashboard/common";

/** What stands on screen while a quiz opens (board Saving, "While a quiz opens"): header, page list, phone, panel. */
export function EditorSkeleton() {
  return (
    <div role="status" aria-label={dashLabels.loading} className="overflow-hidden rounded-[14px] border border-line bg-white">
      <div className="flex items-center gap-4 border-b border-line px-5 py-3.5">
        <Skeleton className="h-5 w-[90px]" />
        <Skeleton className="h-6 w-40" />
        <span className="grow" />
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="flex gap-5 bg-dash p-5">
        <div className="flex w-[180px] flex-none flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[52px]" />
          ))}
        </div>
        <div className="flex flex-1 justify-center">
          <Skeleton className="h-[300px] w-[200px] rounded-3xl" />
        </div>
        <div className="flex w-[200px] flex-none flex-col gap-3.5">
          <Skeleton className="h-5 w-[120px]" />
          <Skeleton className="h-11" />
          <Skeleton className="h-5 w-[150px]" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </div>
    </div>
  );
}
