import Link from "next/link";
import type { Metadata } from "next";
import { accountHref, adminHref, authProblemHref, quizHref, routes, verifyEmailExpiredHref, verifyEmailHref } from "@/lib/routes";

export const metadata: Metadata = { title: "Not designed yet · Quiz", robots: { index: false } };

type Item = { id: string; title: string; built: string; links: { label: string; href: string }[] };
type Group = { title: string; note?: string; items: Item[] };

const editor = quizHref.edit("quiz-body-reset");

/**
 * Every screen, state and wording that Code built WITHOUT a board in Claude Design (owner decision 2026-11-08: no access to the design
 * from this account, so build simple versions and list them). Design each one, then tell Code to match it. The same list, with more
 * detail, is in `plan/project_checklist.md` section H and `plan/project_handover.md` 13.1. Keep the three in step.
 */
const groups: Group[] = [
  {
    title: "Register, log in and passwords",
    items: [
      { id: "G9", title: "Field errors on Register, Forgot password and Set a new password", built: "A red message under the wrong field after pressing the button (name missing, email not valid, password too short, the two passwords differ). Log in still uses the browser’s own messages.", links: [{ label: "Register (press the button empty)", href: routes.register }, { label: "Forgot password", href: routes.forgotPassword }, { label: "Set a new password", href: routes.resetPassword }] },
      { id: "G11", title: "“Couldn’t send” and “sending” states", built: "A spinner on the button while sending. On the check-your-email screen a red banner if “Send the email again” fails (only seen when the email service is down). Other states: see G25.", links: [{ label: "Verify email: check your inbox", href: routes.verifyEmail }] },
      { id: "G25", title: "Bot check and rate limit messages", built: "A red banner above Register and Forgot password when the bot check fails or there were too many tries; “That is your old password” above Set a new password; Contact says “not sent” when the bot check fails.", links: [{ label: "Register: bot check failed", href: authProblemHref(routes.register, "check") }, { label: "Register: too many tries", href: authProblemHref(routes.register, "wait") }, { label: "Forgot password: too many tries", href: authProblemHref(routes.forgotPassword, "wait") }, { label: "Set a new password: old password", href: authProblemHref(routes.resetPassword, "same-password") }] },
      { id: "G5", title: "After the “confirm your new email” link", built: "A good link lands on Account with the toast “Your email address was changed”. An old link shows the expired screen with the words of an email change and a button to Account.", links: [{ label: "Account with the toast (log in first)", href: accountHref.emailChanged }, { label: "Expired link for an email change", href: verifyEmailExpiredHref("email-change") }] },
      { id: "G10", title: "Phone menu when logged in", built: "The same four links, plus “Account settings” and “Log out” under them. Open the menu at phone width after logging in.", links: [{ label: "Home (log in first, then shrink the window)", href: routes.home }] },
      { id: "G12", title: "“Go to my quizzes” for a logged-out person", built: "Lands on the log in screen and then on the dashboard. Confirm that is wanted.", links: [{ label: "404 page", href: "/this-page-does-not-exist" }] },
    ],
  },
  {
    title: "Quiz list",
    items: [
      { id: "G8", title: "Quiz card state “Full”", built: "Grey pill “Full”, the line “It reached 500 responses. People see that it is closed.”, no Copy link and no Open/Close in the menu. Use the dev button “Body Reset: 500 responses” first.", links: [{ label: "Your quizzes (after the dev button)", href: routes.dashboard }, { label: "Dev buttons", href: routes.dev }] },
      { id: "G13–G16", title: "Rename dialog, copy-a-quiz picker, usage meter popover, toast words", built: "Rename is built like New quiz. “A copy of a quiz I already have” has a dropdown. “3 of 5 quizzes” opens a small meter. Toasts: Link copied, Quiz renamed / duplicated / closed / opened / deleted, a generic error toast, and “Check your email” on the phone gate.", links: [{ label: "Your quizzes", href: routes.dashboard }] },
    ],
  },
  {
    title: "Editor",
    items: [
      { id: "G1", title: "“This quiz was changed somewhere else” dialog", built: "A dialog that cannot be closed, with “Load the newest” and “Keep my version”. It appears when a second tab or window saved first. Use the dev switch “Next editor save says changed somewhere else”.", links: [{ label: "Editor (turn the switch on at /dev first)", href: editor }, { label: "Dev switches", href: routes.dev }] },
      { id: "G2 / G20", title: "Edit with AI: “Nothing would change”", built: "A small message with a Back button when the pasted answer equals the current quiz.", links: [{ label: "Editor → Edit with AI → paste the quiz back", href: editor }] },
      { id: "G3", title: "Picture library: no delete or rename", built: "The library only grows (decision: not in v1). Not a screen. Confirm it is fine.", links: [{ label: "Editor → Add a picture", href: editor }] },
      { id: "G4 / G17 / G19", title: "Blocked move toast, empty page titles, small wording", built: "“That move would make a condition look at a later page.”; a page with no title shows its kind; “Edit last page”; field errors for title, message, number range and button text; web address errors other than “taken”; the picture buttons Change and Remove.", links: [{ label: "Editor", href: editor }] },
      { id: "G26", title: "Web address check pauses past 30 checks a minute", built: "The live “is this address free” check stops quietly and the spinner goes away; typing again asks again. No message (decision D11).", links: [{ label: "Editor → Quiz settings", href: quizHref.settings("quiz-body-reset") }] },
      { id: "G18", title: "Publish dialog on the first publish", built: "“Publish your quiz?” with “Your quiz has N pages.”", links: [{ label: "Editor of a never-published quiz", href: quizHref.edit("quiz-customer-feedback") }] },
    ],
  },
  {
    title: "Responses and account",
    items: [
      { id: "G21", title: "Responses wording", built: "No match in the Individual search, the “Removed questions” group in Summary, and the toast after deleting all responses.", links: [{ label: "Responses: Summary", href: quizHref.responses("quiz-body-reset") }, { label: "Responses: Individual", href: `${quizHref.responses("quiz-body-reset")}?view=individual` }] },
      { id: "G6", title: "Disconnect Google", built: "When Google is connected and the person also has a password, the button says “Disconnect” and opens a “Disconnect Google?” question. A person who started with Google and later set a password cannot disconnect (Supabase keeps an account’s last sign-in method), so the row stays “Connected”.", links: [{ label: "Account (press Connect first in the dummy data)", href: routes.account }] },
      { id: "G22", title: "Account details", built: "A new email is typed and sent with Enter or by leaving the field; the wrong-email message; “Set a password” for a Google-only account.", links: [{ label: "Account", href: routes.account }] },
    ],
  },
  {
    title: "Admin",
    items: [
      { id: "G7", title: "Users filter “Near a limit”", built: "A fourth choice in the filter. The Overview counter “Close to a Free plan limit” now opens the Users list on it.", links: [{ label: "Users: near a limit (log in as admin)", href: `${adminHref.users}?filter=near-limit` }] },
      { id: "G24", title: "Admin wording and states", built: "The Free state of the Plan card; “They” instead of “She/her”; limit-box error; empty search; toasts; loading and failed cards; “Person not found”; notes save when the box loses focus; “Newest people” shows Today / Yesterday / a date.", links: [{ label: "Admin overview", href: adminHref.overview }, { label: "A person on the Free plan", href: adminHref.user("u-sarah-lee") }, { label: "Person not found", href: adminHref.user("nobody") }] },
    ],
  },
  {
    title: "The quiz people take",
    items: [
      { id: "G23", title: "Quiz runtime wording and small rules", built: "Messages for a required text, phone and number; the helper line for a number with only a minimum or maximum; a single-choice question that is not required shows Continue; the Loading page has no Back; a white screen while the quiz opens; “Close preview” goes to the editor; a picture on an End page shows under the text.", links: [{ label: "Body Reset", href: quizHref.public("body-reset") }, { label: "Try it", href: quizHref.preview("quiz-body-reset") }] },
      { id: "G25", title: "“Welcome back” when the quiz changed", built: "No board for a quiz that was changed after the person started: their answers to removed pages are kept but not shown. The maintenance page is used as it is for maintenance mode.", links: [{ label: "Maintenance", href: routes.maintenance }] },
    ],
  },
  {
    title: "Approved changes that the boards do not show yet",
    note: "You approved these in chat. The code follows them; the boards still show the old version.",
    items: [
      { id: "D1", title: "Every email link lasts 1 hour", built: "The verify screens and the verify email now say 1 hour (the boards VerifySent, VerifyExpired and EmailVerify say 24 hours). The email-change link stays 24 hours.", links: [{ label: "Verify email", href: routes.verifyEmail }, { label: "Verify link expired", href: routes.verifyEmailExpired }, { label: "The five emails", href: routes.devEmails }, { label: "Verify (sent again)", href: verifyEmailHref("resent") }] },
      { id: "D2", title: "Google login joins an existing account", built: "The screen “Log in: Google, account exists” is gone from the code. Remove its two boards (desktop and phone) and update BehaviorRules.", links: [{ label: "Log in", href: routes.login }] },
    ],
  },
];

const linkClass =
  "flex min-h-11 items-center rounded-[10px] border border-line bg-white px-3.5 text-[15px] font-medium text-slate no-underline hover:bg-soft focus-visible:outline-[3px] focus-visible:outline-slate";

/** Dev only: the list of what has no board yet, with a link to see each one. */
export default function UndesignedPage() {
  return (
    <div className="min-h-screen bg-dash font-inter text-ink">
      <div className="mx-auto max-w-[880px] px-[18px] py-10 sm:px-6">
        <p className="m-0 text-sm">
          <Link href={routes.dev} className="font-semibold text-slate">
            Test links
          </Link>
        </p>
        <h1 className="m-0 mt-2 text-[32px] font-extrabold tracking-[-0.03em]">Not designed yet</h1>
        <p className="mb-0 mt-2 text-base text-mute">
          Everything below was built by Code without a board in Claude Design. Each one works, and some are plain on purpose. Design the ones you care about, then ask Code to match them. The same list is in <code>plan/project_checklist.md</code>, section H.
        </p>

        {groups.map((group) => (
          <section key={group.title} className="mt-9">
            <h2 className="m-0 text-xl font-bold">{group.title}</h2>
            {group.note ? <p className="mb-0 mt-1 text-[15px] text-mute">{group.note}</p> : null}
            <ul className="mt-3 flex list-none flex-col gap-3 p-0">
              {group.items.map((item) => (
                <li key={`${item.id}-${item.title}`} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="rounded-full bg-slate px-2.5 py-0.5 text-xs font-bold text-white">{item.id}</span>
                    <h3 className="m-0 text-base font-bold">{item.title}</h3>
                  </div>
                  <p className="mb-3 mt-2 text-[15px] leading-6 text-ink-2">{item.built}</p>
                  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {item.links.map((link) => (
                      <li key={link.href + link.label}>
                        <Link href={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
