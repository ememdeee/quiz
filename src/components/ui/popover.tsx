"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** A small panel that opens from a button and holds a little information (for example the usage meter). */
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className, ...rest }: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align="end"
        sideOffset={8}
        className={cn(
          "z-40 w-[300px] animate-[appear_0.2s_ease-out] rounded-2xl border border-line bg-white p-5 shadow-[0_16px_40px_rgba(51,65,85,0.18)] focus:outline-none",
          className,
        )}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
}
