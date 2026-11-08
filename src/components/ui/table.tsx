import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A data table (board UINavigation). It scrolls sideways on narrow windows and a row never
 * wraps onto two lines. Every second row is tinted so the eye can follow it.
 */
export function Table({ className, children, ...rest }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className={cn("w-full border-collapse text-left text-[15px]", className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

export const TableHead = (p: ComponentProps<"thead">) => <thead {...p} />;
export const TableBody = (p: ComponentProps<"tbody">) => <tbody {...p} />;

export function TableRow({ className, ...rest }: ComponentProps<"tr">) {
  return <tr className={cn("border-t border-line first:border-t-0 even:bg-dash", className)} {...rest} />;
}

export function TableHeadCell({ className, ...rest }: ComponentProps<"th">) {
  return <th scope="col" className={cn("whitespace-nowrap bg-dash px-4 py-3.5 text-sm font-semibold text-ink-2", className)} {...rest} />;
}

export function TableCell({ className, ...rest }: ComponentProps<"td">) {
  return <td className={cn("whitespace-nowrap px-4 py-3.5", className)} {...rest} />;
}
