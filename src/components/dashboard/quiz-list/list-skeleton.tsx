import { Skeleton } from "@/components/ui/skeleton";
import { dashLabels } from "@/content/dashboard/common";

/** The quiz list while it loads (the grey blocks of board AccountMenu): a heading, a line and three cards. */
export function ListSkeleton() {
  return (
    <div role="status" aria-label={dashLabels.loading} className="flex flex-col gap-[18px]">
      <Skeleton className="h-[34px] w-[220px]" />
      <Skeleton className="h-[18px] w-[340px] max-w-full" />
      <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[150px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
