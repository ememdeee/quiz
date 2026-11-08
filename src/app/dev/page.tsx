import Link from "next/link";
import type { Metadata } from "next";
import { DashboardDevTools } from "@/components/dev/dashboard-tools";
import { MOCK_PASSWORD, mockAccounts } from "@/data/mock/accounts";
import { adminHref, contactHref, loginHref, quizHref, routes, verifyEmailHref } from "@/lib/routes";
import { getSessionUser } from "@/server/session";

export const metadata: Metadata = { title: "Test links · Quiz", robots: { index: false } };

const as = (who: "user" | "admin" | "out", next: string = routes.dev) => `${routes.devSession}?as=${who}&next=${encodeURIComponent(next)}`;

const quizGroup = {
  title: "The quiz people take",
  note: "No login needed. Answers are saved in the dummy data, so they appear in Responses. Use the switches above to see “We couldn’t save your answer” and “Something went wrong”. Open a quiz, stop half way, and open it again for “Welcome back”.",
  links: [
    { label: "Body Reset (live, one question only for “Lose weight”)", href: quizHref.public("body-reset") },
    { label: "Debug quiz (closed)", href: quizHref.public("debug-quiz") },
    { label: "Customer feedback (not published)", href: quizHref.public("customer-feedback") },
    { label: "A link that does not exist", href: quizHref.public("no-such-quiz") },
    { label: "Try it: Body Reset, draft with 3 changes (log in first)", href: quizHref.preview("quiz-body-reset") },
    { label: "Try it: Customer feedback, never published (log in first)", href: quizHref.preview("quiz-customer-feedback") },
  ],
};

const adminGroup = {
  title: "Admin (log in as the admin first)",
  note: "Only the admin can open these. A normal person or a visitor sees “You don’t have access to this page”. Suspend, delete and plan changes are kept in the dummy data; “Reset the dummy data” puts the people back.",
  links: [
    { label: "Overview", href: adminHref.overview },
    { label: "Users", href: adminHref.users },
    { label: "Users: not verified", href: `${adminHref.users}?filter=unverified` },
    { label: "A person on the Custom plan (Maria Gomez)", href: adminHref.user("u-maria") },
    { label: "A person on the Free plan (Sarah Lee)", href: adminHref.user("u-sarah-lee") },
    { label: "A suspended person (Kevin Ross)", href: adminHref.user("u-suspended") },
    { label: "Your own account (cannot suspend or delete)", href: adminHref.user("u-self") },
    { label: "A person that does not exist", href: adminHref.user("nobody") },
  ],
};

const groups: { title: string; note?: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Website",
    links: [
      { label: "Home", href: routes.home },
      { label: "Pricing", href: routes.pricing },
      { label: "Contact", href: routes.contact },
      { label: "Contact: errors", href: contactHref("error") },
      { label: "Contact: message sent", href: contactHref("sent") },
      { label: "Terms of Service", href: routes.terms },
      { label: "Privacy Policy", href: routes.privacy },
    ],
  },
  {
    title: "Full-page messages",
    links: [
      { label: "Page not found (404)", href: "/this-page-does-not-exist" },
      { label: "Something went wrong (500)", href: routes.dev500 },
      { label: "Maintenance", href: routes.maintenance },
    ],
  },
  {
    title: "Register and log in",
    links: [
      { label: "Register", href: routes.register },
      { label: "Log in", href: routes.login },
      { label: "Log in: wrong password", href: loginHref("error") },
      { label: "Log in: email not verified", href: loginHref("unverified") },
      { label: "Log in: too many tries", href: loginHref("too-many") },
      { label: "Log in: account suspended", href: loginHref("suspended") },
      { label: "Log in: Google cancelled", href: loginHref("google-cancelled") },
    ],
  },
  {
    title: "Passwords and verifying email",
    links: [
      { label: "Forgot password", href: routes.forgotPassword },
      { label: "Forgot password: check your email", href: routes.forgotPasswordSent },
      { label: "Set a new password", href: routes.resetPassword },
      { label: "Password updated", href: routes.resetPasswordDone },
      { label: "Reset link expired", href: routes.resetPasswordExpired },
      { label: "Verify email: check your inbox", href: routes.verifyEmail },
      { label: "Verify email: sent again", href: verifyEmailHref("resent") },
      { label: "Email verified", href: routes.verifyEmailDone },
      { label: "Verify link expired", href: routes.verifyEmailExpired },
      { label: "Account deleted", href: routes.goodbye },
    ],
  },
];

const dashboardGroup = {
  title: "Dashboard (log in first)",
  note: "Log in as a normal person above. Phones and narrow windows (under 900 px) show “The dashboard works best on a computer”.",
  links: [
    { label: "Your quizzes", href: routes.dashboard },
    { label: "Editor: published with 3 changes waiting (Body Reset)", href: quizHref.edit("quiz-body-reset") },
    { label: "Editor: published and up to date, closed (Debug quiz)", href: quizHref.edit("quiz-debug") },
    { label: "Editor: never published, no question yet (Customer feedback)", href: quizHref.edit("quiz-customer-feedback") },
    { label: "Responses: Summary (Body Reset)", href: quizHref.responses("quiz-body-reset") },
    { label: "Responses: Individual", href: `${quizHref.responses("quiz-body-reset")}?view=individual` },
    { label: "Responses: nothing yet (Customer feedback)", href: quizHref.responses("quiz-customer-feedback") },
    { label: "Account", href: routes.account },
    { label: "Editor with the Quiz settings panel open", href: quizHref.settings("quiz-body-reset") },
    { label: "Quiz not found", href: quizHref.edit("does-not-exist") },
    { label: "UI kit: every component", href: routes.devUi },
    { label: "What each template contains", href: routes.devTemplates },
    { label: "The five emails", href: routes.devEmails },
  ],
};

const linkClass =
  "flex min-h-11 items-center justify-between gap-3 rounded-[10px] border border-line bg-white px-3.5 text-[15px] font-medium text-slate no-underline hover:bg-soft focus-visible:outline-[3px] focus-visible:outline-slate";

/** Dev only: every screen of the website on one page, so nothing has to be typed by hand. */
export default async function DevPage() {
  const user = await getSessionUser();
  return (
    <div className="min-h-screen bg-dash font-inter text-ink">
      <div className="mx-auto max-w-[880px] px-[18px] py-10 sm:px-6">
        <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.03em]">Test links</h1>
        <p className="mb-0 mt-2 text-base text-mute">
          For building and testing only. This page does not exist on the real website. Every link opens a screen of the design; resize the window or use the phone view to check the phone layout.
        </p>

        <Link href={routes.devUndesigned} className={`${linkClass} mt-6 border-2 border-slate`}>
          Not designed yet: every screen Code built without a board, with a link to see each one
        </Link>

        <section className="mt-8 rounded-2xl border border-line bg-white p-5">
          <h2 className="m-0 text-lg font-bold">Who is logged in</h2>
          <p className="mb-3 mt-1 text-[15px] text-mute">
            Now: <strong className="text-ink">{user ? `${user.name} (${user.isAdmin ? "admin" : "normal person"})` : "nobody"}</strong>. The menu at the top of the website changes with it.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <a href={as("out")} className={linkClass}>Log out</a>
            <a href={as("user")} className={linkClass}>Log in as a normal person</a>
            <a href={as("admin")} className={linkClass}>Log in as the admin</a>
          </div>
        </section>

        {[dashboardGroup, quizGroup, adminGroup, ...groups].map((group) => (
          <section key={group.title} className="mt-8">
            <h2 className="m-0 text-lg font-bold">{group.title}</h2>
            {"note" in group && group.note ? <p className="mb-0 mt-1 text-[15px] text-mute">{group.note}</p> : null}
            {group.title.startsWith("Dashboard") ? <DashboardDevTools /> : null}
            <ul className="mt-3 grid list-none gap-2.5 p-0 sm:grid-cols-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                    <code className="truncate text-xs font-normal text-mute">{link.href}</code>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-8 rounded-2xl border border-line bg-white p-5">
          <h2 className="m-0 text-lg font-bold">Test accounts for the Log in screen</h2>
          <p className="mb-3 mt-1 text-[15px] text-mute">
            These are made up. Password for all of them: <code className="rounded bg-soft px-1.5 py-0.5">{MOCK_PASSWORD}</code>. Any other email or password shows “wrong password”.
          </p>
          <ul className="m-0 list-none p-0 text-[15px]">
            {mockAccounts.map((account) => (
              <li key={account.email} className="flex flex-wrap justify-between gap-2 border-t border-line py-2 first:border-t-0">
                <code>{account.email}</code>
                <span className="text-mute">
                  {account.outcome === "user" && "logs in as a normal person"}
                  {account.outcome === "admin" && "logs in as the admin"}
                  {account.outcome === "unverified" && "shows “verify your email first”"}
                  {account.outcome === "suspended" && "shows “account is suspended”"}
                  {account.outcome === "too-many" && "shows “too many tries”"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
