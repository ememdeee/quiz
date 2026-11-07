import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Website buttons (pill shaped, 999 radius). One look for links and real buttons.
 * Sizes keep the 44 px touch target: sm 44, md 54, lg 56.
 * They lift on hover with the shared `.lift` class (smooth, and no flicker at the edge).
 */
export const buttonVariants = cva(
  [
    "lift relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold no-underline",
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
      },
      size: {
        sm: "min-h-11 px-5 text-[15px]",
        md: "min-h-[54px] px-7 text-[17px]",
        lg: "min-h-14 px-8 text-lg",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
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

/** The moving light across a primary button. Decoration only. */
function Shine({ variant }: { variant: StyleProps["variant"] }) {
  return variant === undefined || variant === "primary" ? <span aria-hidden="true" className="shine" /> : null;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps & { loading?: boolean };

export function Button({ variant, size, block, loading, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...rest}
    >
      <Shine variant={variant} />
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & StyleProps & { href: string };

/** A link that looks like a button. mailto: links use a plain anchor. */
export function ButtonLink({ variant, size, block, className, href, children, ...rest }: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size, block }), className);
  const content = (
    <>
      <Shine variant={variant} />
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
export function DisabledButton({ variant, size, block, className, children }: StyleProps & { className?: string; children: ReactNode }) {
  return (
    <span aria-disabled="true" className={cn(buttonVariants({ variant, size, block }), className)}>
      {children}
    </span>
  );
}
