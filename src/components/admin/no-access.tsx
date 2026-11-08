import { ButtonLink } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icons";
import { noAccess } from "@/content/admin";
import { routes } from "@/lib/routes";

/** "You don't have access to this page" (board AdminNoAccess). */
export function NoAccess() {
  return (
    <main className="grid min-h-dvh place-items-center bg-dash px-6 font-inter text-slate">
      <div className="flex w-full max-w-[460px] flex-col items-center gap-3 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-soft text-slate">
          <LockIcon size={30} />
        </span>
        <h1 className="m-0 mt-2 text-[28px] font-extrabold leading-[34px] tracking-[-0.02em] text-ink">{noAccess.title}</h1>
        <p className="m-0 text-[17px] leading-[26px] text-mute">{noAccess.text}</p>
        <ButtonLink href={routes.dashboard} className="mt-2.5">
          {noAccess.button}
        </ButtonLink>
      </div>
    </main>
  );
}
