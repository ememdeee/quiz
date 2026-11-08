import { Card, IconBadge, StepNumber } from "@/components/ui/card";
import { MailIcon } from "@/components/ui/icons";
import { contact } from "@/content/contact";
import { textLink } from "@/components/ui/link-styles";
import { CONTACT_EMAIL, mailto } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Right-hand column of the contact page: the email address and what happens next. */
export function ContactAside() {
  return (
    <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
      <Card className="p-[26px] [--lift:4px]">
        <IconBadge>
          <MailIcon />
        </IconBadge>
        <h2 className="mb-1 mt-4 text-xl font-bold">{contact.email.title}</h2>
        <p className="mb-3 mt-0 text-base text-mute">{contact.email.text}</p>
        <a href={mailto()} className={cn("rounded text-lg font-semibold text-slate focus-visible:outline-[3px] focus-visible:outline-slate", textLink)}>
          {CONTACT_EMAIL}
        </a>
      </Card>
      <Card className="p-[26px] [--lift:4px]">
        <h2 className="mb-4 mt-0 text-xl font-bold">{contact.next.title}</h2>
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {contact.next.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3.5">
              <StepNumber size="sm">{i + 1}</StepNumber>
              <span className="text-base leading-6">{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </aside>
  );
}
