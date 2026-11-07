"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "./icons";

/** Keyboard focus ring shared by the small controls: 3 px slate outline, 2 px offset. */
const focus = "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate";
const off = "disabled:cursor-not-allowed disabled:opacity-45";

/** On/off switch (board UIButtons, "Choices"). Give it a visible label or `aria-label`. */
export function Switch({ className, ...rest }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "inline-flex h-[26px] w-11 flex-none cursor-pointer items-center rounded-full bg-ctrl transition-colors duration-200 data-[state=checked]:bg-slate",
        focus,
        off,
        className,
      )}
      {...rest}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-[3px] rounded-full bg-white transition-[translate] duration-200 data-[state=checked]:translate-x-[21px]" />
    </SwitchPrimitive.Root>
  );
}

export function Checkbox({ className, ...rest }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "grid size-[22px] flex-none cursor-pointer place-items-center rounded-md border-2 border-ctrl bg-white text-white transition-colors duration-200 data-[state=checked]:border-slate data-[state=checked]:bg-slate",
        focus,
        off,
        className,
      )}
      {...rest}
    >
      <CheckboxPrimitive.Indicator>
        <CheckIcon size={14} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/** A group of radios. Use `Radio` inside it. */
export const RadioGroup = RadioGroupPrimitive.Root;

/** A radio drawn as a small card (the templates in New quiz). Put the words inside it. */
export function RadioCard({ className, ...rest }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "flex min-h-16 cursor-pointer flex-col items-start gap-0.5 rounded-[10px] border border-line-strong bg-white px-3.5 py-3 text-left transition-colors duration-150",
        "data-[state=checked]:border-2 data-[state=checked]:border-slate data-[state=checked]:px-[13px] data-[state=checked]:py-[11px]",
        focus,
        className,
      )}
      {...rest}
    />
  );
}

export function Radio({ className, ...rest }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "size-[22px] flex-none cursor-pointer rounded-full border-2 border-ctrl bg-white transition-[border-width,border-color] duration-150 data-[state=checked]:border-[7px] data-[state=checked]:border-slate",
        focus,
        off,
        className,
      )}
      {...rest}
    />
  );
}
