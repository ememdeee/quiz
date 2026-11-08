"use client";

import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A menu that opens from a button (board UIFeedback). Arrow keys move through the items,
 * Escape closes it. Put dangerous items last, after a `MenuSeparator`.
 */
export const Menu = MenuPrimitive.Root;
export const MenuTrigger = MenuPrimitive.Trigger;

export function MenuContent({ className, ...rest }: ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        align="end"
        sideOffset={8}
        className={cn(
          "z-40 w-[230px] animate-[appear_0.2s_ease-out] rounded-[14px] border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(51,65,85,0.18)]",
          className,
        )}
        {...rest}
      />
    </MenuPrimitive.Portal>
  );
}

export function MenuItem({
  icon,
  danger,
  className,
  children,
  ...rest
}: ComponentProps<typeof MenuPrimitive.Item> & { icon?: ReactNode; danger?: boolean }) {
  return (
    <MenuPrimitive.Item
      className={cn(
        "flex min-h-12 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[15px] font-medium outline-none transition-colors duration-150",
        "data-[highlighted]:bg-soft data-[disabled]:pointer-events-none data-[disabled]:opacity-45 focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-slate",
        danger ? "text-danger" : "text-slate",
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </MenuPrimitive.Item>
  );
}

export function MenuSeparator() {
  return <MenuPrimitive.Separator className="my-1 border-t border-line" />;
}
