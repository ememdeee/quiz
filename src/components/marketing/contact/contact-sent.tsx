import { ButtonLink } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { contact } from "@/content/contact";
import { routes } from "@/lib/routes";

/** Shown instead of the form after a message is sent (board ContactSent). */
export function ContactSent() {
  return (
    <div className="grid min-h-[520px] animate-[fade-up_0.45s_var(--ease-enter)] place-items-center px-5 py-16">
      <div role="status" className="w-[520px] max-w-full rounded-3xl border border-line bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(51,65,85,0.1)]">
        <span className="mx-auto grid size-[72px] animate-[pop-in_700ms_cubic-bezier(.2,1.4,.4,1)_backwards] place-items-center rounded-full bg-slate text-white">
          <CheckIcon size={34} />
        </span>
        <h1 className="mb-2 mt-[22px] text-[30px] font-extrabold leading-9 tracking-[-0.02em]">{contact.sent.title}</h1>
        <p className="mb-[26px] mt-0 text-[17px] leading-[27px] text-mute">{contact.sent.text}</p>
        <ButtonLink href={routes.home} size="md" className="min-h-[52px] px-7 text-base">
          {contact.sent.button}
        </ButtonLink>
      </div>
    </div>
  );
}
