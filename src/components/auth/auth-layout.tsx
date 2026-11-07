import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { textLink } from "@/components/ui/link-styles";
import { cn } from "@/lib/utils";
import { AuthPanel, type AuthPanelSpec } from "./auth-panel";

/** Items inside a sign-in screen: stacked with 18 px between them, sliding in one after another. */
export const authStack = "stagger flex flex-col gap-[18px]";

export const authLink = cn("rounded font-semibold text-slate focus-visible:outline-[3px] focus-visible:outline-slate", textLink);

/** Split screen for every sign-in page: form on the left, dark panel on the right (hidden on phones). */
export function AuthLayout({ panel, children }: { panel: AuthPanelSpec; children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-2 bg-white font-inter text-ink max-nav:grid-cols-1">
      <div className="flex flex-col p-5 nav:px-12 nav:py-7">
        <div>
          <Logo height={36} />
        </div>
        <main id="main" className="m-auto w-full max-w-[400px] py-8">
          {children}
        </main>
      </div>
      <AuthPanel spec={panel} />
    </div>
  );
}

/** For sign-in screens without a form (the "check your email" and "done" screens). */
export function AuthStack({ children }: { children: ReactNode }) {
  return <div className={authStack}>{children}</div>;
}

export function AuthHeading({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <div>
      <h1 className="m-0 text-[32px] font-extrabold leading-[38px] tracking-[-0.03em] nav:text-4xl nav:leading-[42px]">{title}</h1>
      {sub ? <p className="mb-0 mt-2 text-[17px] leading-[26px] text-mute [&_strong]:font-bold [&_strong]:text-ink">{sub}</p> : null}
    </div>
  );
}
