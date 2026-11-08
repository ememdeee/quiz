import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * One button look for links and real buttons. shape="pill" (999 radius) is the website,
 * shape="box" (10 px radius) is the dashboard. Sizes keep the 44 px touch target:
 * pill sm 44, md 54, lg 56; box sm 44, md 48.
 * They lift on hover with the shared `.lift` class (smooth, and no flicker at the edge).
 */
export const buttonVariants = cva(
  [
    "lift relative inline-flex select-none items-center justify-center gap-2 font-semibold no-underline",
    "transition-[translate,background-color,color,border-color] duration-200",
    "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate",
    "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "[--lift:2px]",
  ],
  {
    variants: {
      variant: {
        primary: "bg-slate text-white [--lift-shadow:0_14px_30px_rgba(51,65,85,0.28)]",
        secondary: "border border-line-strong bg-white text-slate hover:bg-dash [--lift:1px] [--lift-shadow:0_8px_18px_rgba(51,65,85,0.10)]",
        light: "bg-white text-ink focus-visible:outline-white [--lift-shadow:0_14px_30px_rgba(0,0,0,0.25)]",
        ghost: "bg-transparent text-slate hover:bg-soft [--lift:0px] [--lift-shadow:none]",
        danger: "bg-danger text-white [--lift-shadow:0_14px_30px_rgba(179,38,30,0.28)]",
        "danger-quiet": "border border-danger bg-white text-danger hover:bg-danger-soft [--lift:1px] [--lift-shadow:0_8px_18px_rgba(179,38,30,0.12)]",
      },
      size: {
        sm: "min-h-11 px-5 text-[15px]",
        md: "min-h-[54px] px-7 text-[17px]",
        lg: "min-h-14 px-8 text-lg",
      },
      shape: { pill: "rounded-full", box: "rounded-[10px]" },
      block: { true: "w-full", false: "" },
    },
    compoundVariants: [
      { shape: "box", size: "sm", className: "px-4" },
      { shape: "box", size: "md", className: "min-h-12 px-[22px] text-base" },
    ],
    defaultVariants: { variant: "primary", size: "md", shape: "pill", block: false },
  },
);

type StyleProps = VariantProps<typeof buttonVariants>;

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-[18px] animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-current border-t-transparent", className)}
    />
  );
}

/** The moving light across a primary website button. Decoration only; the dashboard has none. */
function Shine({ variant, shape }: Pick<StyleProps, "variant" | "shape">) {
  const isPrimary = variant === undefined || variant === "primary";
  return isPrimary && shape !== "box" ? <span aria-hidden="true" className="shine" /> : null;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps & { loading?: boolean };

export function Button({ variant, size, shape, block, loading, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, shape, block }), className)}
      {...rest}
    >
      <Shine variant={variant} shape={shape} />
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & StyleProps & { href: string };

/** A link that looks like a button. mailto: links use a plain anchor. */
export function ButtonLink({ variant, size, shape, block, className, href, children, ...rest }: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size, shape, block }), className);
  const content = (
    <>
      <Shine variant={variant} shape={shape} />
      {children}
    </>
  );
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}

/** The same button look for something that cannot be used right now (not a link, not clickable). */
export function DisabledButton({ variant, size, shape, block, className, children }: StyleProps & { className?: string; children: ReactNode }) {
  return (
    <span aria-disabled="true" className={cn(buttonVariants({ variant, size, shape, block }), className)}>
      {children}
    </span>
  );
}
