"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Tabs (board UINavigation): a soft track with the chosen tab raised in white. The class names are shared with tab-like links. */
export const tabsListClass = "inline-flex gap-1 rounded-xl bg-soft p-1";
export const tabClass = cn(
  "inline-flex min-h-10 items-center rounded-[9px] px-[18px] text-[15px] font-medium text-ink-2 transition-colors duration-200",
  "data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:text-slate aria-[current=page]:bg-white aria-[current=page]:font-semibold aria-[current=page]:text-slate",
  "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate",
);

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList({ className, ...rest }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn(tabsListClass, className)} {...rest} />;
}

export function TabsTrigger({ className, ...rest }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger className={cn(tabClass, className)} {...rest} />
  );
}
