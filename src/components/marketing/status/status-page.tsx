import { Button, ButtonLink } from "@/components/ui/button";
import { HeroBackdrop } from "../hero-backdrop";

type Action = { label: string; href: string } | { label: string; onClick: () => void };

const wobble = "animate-[wobble_4s_ease-in-out_infinite_alternate]";

function Ring({ variant }: { variant: "dot" | "clock" }) {
  return variant === "dot" ? (
    <svg viewBox="0 0 64 64" fill="none" className={`h-[0.72em] w-auto ${wobble}`}>
      <circle cx="32" cy="32" r="22" stroke="var(--color-slate)" strokeWidth="10" />
      <circle cx="32" cy="32" r="8" fill="var(--color-steel)" />
    </svg>
  ) : (
    <svg viewBox="0 0 64 64" fill="none" className={`h-[120px] w-auto ${wobble}`}>
      <circle cx="32" cy="32" r="22" stroke="var(--color-slate)" strokeWidth="8" />
      <path d="M32 18v14l9 6" stroke="var(--color-slate)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionButton({ action, secondary }: { action: Action; secondary?: boolean }) {
  const variant = secondary ? "secondary" : "primary";
  if ("href" in action) {
    return (
      <ButtonLink href={action.href} variant={variant}>
        {action.label}
      </ButtonLink>
    );
  }
  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

/** Full-page message: not found, server error, maintenance. */
export function StatusPage({
  code,
  title,
  text,
  primary,
  secondary,
}: {
  /** Two digits around the ring ("4" and "4"), or "clock" for the maintenance page */
  code: [string, string] | "clock";
  title: string;
  text: string;
  primary: Action;
  secondary: Action;
}) {
  return (
    <div className="relative flex min-h-[640px] flex-col items-center justify-center px-6 pb-[72px] pt-12 text-center">
      <HeroBackdrop
        dotsAt="50% 40%"
        blobA={{ top: -60 }}
        blobB={{ top: "auto", bottom: -60 }}
      />
      <div className="relative flex flex-col items-center">
        {code === "clock" ? (
          <div aria-hidden="true">
            <Ring variant="clock" />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="flex items-center gap-[0.02em] text-[clamp(96px,18vw,200px)] font-extrabold leading-none tracking-[-0.06em] text-slate"
          >
            {code[0]}
            <Ring variant="dot" />
            {code[1]}
          </div>
        )}
        <h1 className="mt-3 text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.03em]">{title}</h1>
        <p className="mt-3 max-w-[460px] text-lg leading-7 text-mute">{text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ActionButton action={primary} />
          <ActionButton action={secondary} secondary />
        </div>
      </div>
    </div>
  );
}
