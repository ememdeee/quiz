import type { Metadata } from "next";
import Link from "next/link";
import { emails, renderEmail } from "@emails";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Emails · Quiz", robots: { index: false } };

/** Dev only: the five emails as an inbox would show them, straight from the templates in `emails/` (handover 8.12). */
export default async function EmailsPage() {
  const pages = await Promise.all(emails.map(async (email) => ({ email, html: await renderEmail(email.id) })));

  return (
    <div className="min-h-screen bg-dash font-inter text-slate">
      <div className="mx-auto flex max-w-[760px] flex-col gap-10 px-6 py-9">
        <div>
          <Link href={routes.dev} className="text-sm font-semibold underline">
            Test links
          </Link>
          <h1 className="m-0 mt-2 text-[30px] font-extrabold leading-9 tracking-[-0.02em] text-ink">The five emails</h1>
          <p className="m-0 mt-1 text-base text-mute">
            Nothing is sent from here. Each email is drawn from its template with made-up details. Real sending comes with the email service in Phase 12.
          </p>
          <ul className="m-0 mt-3 flex list-none flex-wrap gap-2.5 p-0">
            {emails.map((email) => (
              <li key={email.id}>
                <a href={`#${email.id}`} className="inline-flex min-h-11 items-center rounded-[10px] border border-line bg-white px-3.5 text-[15px] font-medium text-slate no-underline hover:bg-soft">
                  {email.board}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {pages.map(({ email, html }) => (
          <section key={email.id} id={email.id} aria-labelledby={`${email.id}-title`} className="scroll-mt-6">
            <h2 id={`${email.id}-title`} className="m-0 text-lg font-bold text-ink">
              {email.board}
            </h2>
            <p className="m-0 mb-3 text-sm text-mute">Sent when: {email.when}.</p>
            <p className="m-0 mb-2 px-2 text-[13px] text-mute">
              <strong>{email.header.label}:</strong> {email.header.address} &nbsp; <strong>Subject:</strong> {email.subject}
            </p>
            <iframe title={`${email.board}: ${email.subject}`} srcDoc={html} sandbox="" className="h-[720px] w-full rounded-2xl border border-line bg-white" />
          </section>
        ))}
      </div>
    </div>
  );
}
