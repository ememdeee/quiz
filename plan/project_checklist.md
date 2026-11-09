# Checklist (status of the whole project)
> Last Updated: 2026-11-08
> This is the short, owner-friendly status list. The details of every task are in `project_handover.md` (section 12). **Both files are updated together, in the same session.** When a task is finished: tick it here AND in the handover. When a new task, decision or gap appears: add it to both.
> Legend: `[x]` done, `[ ]` not done. "Owner" = needs Muhammad (an account, a key, a decision). "Code" = Claude Code does it.

---

## A. Now
- **All the code is built, and (2026-11-08) every design gap is now built too, as a simple version.** Every screen, the whole backend on Supabase (login, quizzes, pictures, answering, responses, account, admin, contact, emails), the tests, CI and the runbooks. What is left is mostly **yours** (accounts, decisions, and designing the screens in section H), listed below.
- **Important (owner decision 2026-11-08): this Claude account cannot open the Claude Design artifact**, so Code does not wait for designs any more. Code builds a simple version of anything missing and lists it in **section H** ("NOT DESIGNED YET"). You design those in Claude Design when you want, then tell Code to match. Ugly is fine until then. Nothing in H is hidden: `/dev/undesigned` (local only) links to each one.
- Branch `phase-2-ui` holds everything (it already includes the database branch and the Google/Mailtrap branch). Code commits there; **you push** (Vercel then deploys by itself). Code says when a push is worth doing.
- Done by you: `supabase config push` (verify and reset emails live, "connect Google" on), Vercel account and repo link. **One more `config push` is needed** because the verify email now says "1 hour" (D1; the template file was rebuilt): `node scripts/with-env.mjs npx supabase config push`.
- **Test status (2026-11-08, after this session's changes):** `npm run release-check` green (194 unit tests, lint, typecheck, production build); `test:db` 118 green; `qc:links` and `qc:a11y` green (63 / 66 / 76 pages as visitor / person / admin); `qc:real` 43 of 43 green on the Supabase dev project (one test, "deleting the account", timed out once on a cold first compile and passed alone; it did not fail again); `qc:prod` 12 of 12 green. New real spec `tests/qc/real-gaps.spec.ts` proves G1 (two windows), G8 and G7 against the real database. Not provable here: G6 with a real Google account, G11's "couldn't send", and everything that needs your phone, Gmail or screen reader (section F "Manual checks").
- **CI on GitHub:** the first run on `main` was red (link audit hung on the Supabase test server; database job had no secrets). Fixed in branch `fix-ci` (2026-11-09): push it and open a pull request. Optional for you: add the five Supabase secrets in GitHub (Settings, Secrets and variables, Actions) so the database tests run on every merge; until then that job is skipped with a notice.
- **Working on another computer:** clone the repo, `npm install`, `npx playwright install`, and copy `.env.local` over by a safe way (it is not in git; never through chat or email). The Supabase project, its migrations and its settings live in the cloud, so nothing else moves. Details: `README.md`.
- Run everything yourself any time: `npm run release-check`, `npm run test:db`, `npm run qc:links`, `npm run qc:a11y`, `npm run qc:real`, `npm run qc:prod`.

## B. Design (Claude Design artifact: https://claude.ai/artifact/FiiBUq7uJaBcXyeqfTKtTw)
- [x] All screens designed (158 boards, version 69)
- [x] Behavior rules board "How the quiz behaves" written
- [x] Design gaps G1 to G8, G23, G24 (and G9 to G22, G25): **built by Code in a simple version on 2026-11-08** (nothing is missing in the app any more). They still have **no board**: see section H.
- [ ] **Design the screens in section H** (owner, in Claude Design, whenever ready), then ask Code to match each one. Not a blocker for testing or release; it is a blocker for "design fidelity review done" in section G.
- [ ] Update the boards for the approved changes D1 (every email link lasts 1 hour) and D2 (remove the two `LoginGoogleExists` boards, update BehaviorRules). The code already follows both.

## C. Owner tasks (accounts and things only the owner can do)
- [x] GitHub repo https://github.com/ememdeee/quiz (public)
- [x] Supabase project `quiz-dev` (Singapore, Free)
- [x] Mailtrap sandbox (test inbox), Supabase keys in `.env.local`, Google OAuth dev client
- [x] `config push` run (2026-11-08): the designed verify and reset emails and "connect Google" are live on the dev project. [ ] **Run it once more** after this session (verify email text changed to 1 hour)
- [x] Vercel account created, repo connected; the owner pushes (deploys by itself). Set the environment variables first: see `docs/runbooks/deploy.md` (for a test deploy on the dev project: `NEXT_PUBLIC_DATA_MODE=supabase`, `NEXT_PUBLIC_SITE_URL`, the three Supabase keys, `IP_HASH_SALT`, the Mailtrap names), and in Supabase (Authentication, URL Configuration) set **Site URL** to the Vercel address and add `https://<that address>/**` to the redirect URLs, or the email links still point to localhost
- [x] Preview checked on the Vercel address (2026-11-09: the site runs on `https://quiz.basrh.com` on the Supabase dev project; the owner tried it by hand, see section I)
- [x] DNS for `quiz.basrh.com` and the Resend records (domain verified 2026-11-09)
- [x] Resend account, domain `quiz.basrh.com` verified (2026-11-09), `RESEND_API_KEY` in `.env.local`. Supabase auth emails now use Resend SMTP in `config.toml` (was Mailtrap): **run `config push`**, and add `RESEND_API_KEY` (Secret) and `EMAIL_FROM` in Vercel. Do not run `qc:real` or `test:mail` on this project any more (they would send real emails to fake addresses)
- [x] Cloudflare Turnstile keys (2026-11-09: the widget shows on Register; keys are in Vercel)
- [ ] Sentry project (DSN)
- [ ] Legal details for Terms and Privacy + lawyer review
- [ ] Supabase production project on a paid plan (daily backups), then the restore drill
- [x] Owner account promoted to admin (2026-11-09, `cloudteamize@gmail.com`, done by Code with the service key; the old personal account was deleted). [ ] The owner has not yet opened `/admin` to check (section I)
- [ ] Try Edit with AI with real ChatGPT / Claude / Gemini chats and report what fails (2026-11-09: one real try, it needed two rounds because the AI left out `"picture": null`; prompt and checker fixed, try again; section I)
- [ ] A real iPhone and Android look at the public quiz; real Gmail and one more inbox for the five emails

## D. Decisions (handover section 11)
- [x] D1 link lifetimes = 1 hour for all (design change pending)  - [x] D2 Google linking = accept auto-link (design change pending)  - [ ] D3 slug holds 30 days
- [ ] D4 picture quota (rec: none)  - [x] D5 noindex rules (built)  - [x] D6 analytics = Vercel Web Analytics (built, switches on when the site runs on Vercel)  - [ ] D7 Vercel paid plan
- [x] D8 region (Singapore)  - [x] D9 domain (`quiz.basrh.com`)  - [ ] D10 custom domains later  - [x] D11 rate limits (built in one module)  - [ ] D12 reserved slugs
- [x] D20 Mailtrap for dev emails  - [ ] D21 what stays in the public repo  - [x] D13 "near limit" = 80% (built)  - [ ] D14 Resend  - [x] D15 keep contact messages (built)  - [ ] D17 condition sources  - [x] D18 blocked reorder (built)  - [x] D19 admin response count (finished only, built)

## E. Build phases (handover section 12)
- [x] **Phase 0** Accounts, repo, decisions (the open ones are in C and D)
- [x] **Phase 1** Clean-up and foundation (old app removed, tokens, shared logic with unit tests, Vitest and Playwright, CI, `release-check`, structure doc rewritten, architecture lint rules)
- [ ] **Phase 2** Whole UI with dummy data. **Everything is built and passes the link audit and the accessibility scan.** Left: the Vercel preview (2.13) and the owner saying "UI approved"
  - [x] UI kit  - [x] layouts  - [x] website  - [x] auth screens  - [x] quiz list and new quiz  - [x] editor  - [x] quiz runtime (editor canvas now uses the same views)
  - [x] responses  - [x] account  - [x] admin  - [x] email templates  - [x] session switcher link  - [x] link audit passes (`npm run qc:links`)  - [x] preview deployed (Vercel, `quiz.basrh.com`)
- [x] **Phase 3** Supabase, database, security rules, tests (database tests incl. code-versus-database parity, row-level security check)
- [x] **Phase 4** Register, login, accounts base (real auth)
- [x] **Phase 5** Quizzes and editor for real (autosave, publish, slug check, limits; the "changed somewhere else" dialog is built without a board, G1)
- [x] **Phase 6** Pictures (media library)
- [x] **Phase 7** Public quiz and saving answers
- [x] **Phase 8** Responses: summary, individual, export, delete
- [x] **Phase 9** Edit with AI for real (the owner still tries real AI chats)
- [x] **Phase 10** Account settings (disconnect Google built without a board, G6; email-change landing built without a board, G5)
- [x] **Phase 11** Admin area (the "Near a limit" filter is built without a board, G7)
- [ ] **Phase 12** Email for real: code and tests done; needs the owner's Resend account, DNS and `config push`
- [ ] **Phase 13** Website completion: SEO, icons, share pictures, analytics, placeholders done; final copy and legal need the owner
- [ ] **Phase 14** Hardening: Turnstile, rate limits, security headers and policy, Sentry (off until its key), accessibility and performance checks done; `npm audit` review and secret scan done 2026-11-08 (Next.js bumped to 15.5.29, no secret in the repo or its history; the few findings left are listed in handover Phase 14); backups drill and uptime monitor need the owner's accounts
- [ ] **Phase 15** Full QC run, bug fixing, cleanup: all scripts written and green on the dev stack; two clean runs on staging, other browsers and real phones remain
- [ ] **Phase 16** Release to production, first week watch (steps in `docs/runbooks/deploy.md`)

## F. QC scripts (handover 14.4). Each must be written AND passing
- [x] QC-01 website (link audit + production smoke)  - [x] QC-02 register and verify  - [x] QC-03 login, lock, reset  - [x] QC-04 create quizzes
- [x] QC-05 edit  - [x] QC-06 conditions  - [x] QC-07 pictures  - [x] QC-08 publish and share  - [x] QC-09 slugs, two people
- [x] QC-10 take a quiz (phone)  - [x] QC-11 responses and downloads  - [x] QC-12 limits  - [x] QC-13 isolation between people
- [x] QC-14 account  - [x] QC-15 Edit with AI  - [x] QC-16 admin  - [x] QC-17 emails (password-changed and contact emails read from the test inbox; the verify email by `test:mail`)  - [x] QC-18 accessibility
- [x] QC-19 security  - [x] QC-20 performance  - [x] QC-21 production smoke (on the local production build; the same test against the real domain after launch)
- [x] Database tests pass (Vitest, `npm run test:db`)  - [x] Unit tests pass (`npm test`)  - [ ] Manual checks done (real Google login, real email, real phones, screen reader, keyboard-only pass)

## G. Release gate (all must be true before production)
- [ ] `npm run release-check` green twice in a row
- [ ] Staging QC green
- [ ] Design fidelity review done (every board vs screen)
- [ ] Backups on and restore drill worked
- [ ] Real domain, email domain verified, legal texts final, placeholders removed
- [ ] Production smoke (QC-21) passed after deploy

---

## H. NOT DESIGNED YET: built by Code without a board in Claude Design

> **Baca ini dulu (Bahasa Indonesia):** semua yang ada di bagian ini dibuat langsung di kode oleh Claude Code tanpa desain di Claude Design (akun ini tidak punya akses ke artifact desainnya). Semuanya jalan, tapi tampilannya sederhana dan kata-katanya tebakan Code. Kalau kamu mau mengubahnya: desain dulu di Claude Design, lalu minta Code menyamakan. Saat dibuka secara lokal (`npm run dev`), halaman **`/dev/undesigned`** menampilkan daftar yang sama dengan link ke tiap layar.
>
> Legend: **NEW** = built in the 2026-11-08 session (was missing completely). **GUESS** = built earlier in a simple version, still no board. Each row: where to see it, then what Code decided. Detail of each gap: `project_handover.md` section 13.1 and 13.4.
> Keep this list, `/dev/undesigned` (`src/app/dev/undesigned/page.tsx`) and handover 13.4 in step. When a screen gets its board and the code matches it, delete its row here and write the board name in handover Appendix A.

### H1. Register, log in and passwords
| ID | Where to see it | What Code built |
|---|---|---|
| G9 NEW | `/register`, `/forgot-password`, `/reset-password`: press the button with empty fields | Red message under each wrong field: name missing, email missing or not valid, password missing or under 8 characters, "The two passwords are not the same." The first wrong field gets focus; a message goes away when the person types. Log in still uses the browser's own messages for empty fields |
| G11 NEW | Button spinner on every form; `/verify-email` | "Sending" = the button spinner. If "Send the email again" fails: red banner "We couldn't send the email. Please try again in a minute." (only seen when the email service is down) |
| G25 NEW | `/register?problem=check` and `=wait`, `/forgot-password?problem=wait`, `/reset-password?problem=same-password` | A red banner above the form when the bot check fails, there were too many tries, or the new password is the old one. The contact form now says "not sent" when the bot check fails (before it looked sent) |
| G5 NEW | `/account?email=changed`, `/verify-email/expired?for=email-change` | After the new-address link: toast "Your email address was changed" on Account. An old link: the expired screen worded for an email change ("Links to confirm a new email address work for 24 hours...") with the button "Go to my account" |
| G10 NEW | Phone width, logged in, open the menu on any website page | The same four links, then "Account settings" and "Log out" under them, then the big "My quizzes" button |
| G12 GUESS | 404 page, "Go to my quizzes" | A logged-out person lands on Log in, then on the dashboard |

### H2. Quiz list (and the first web address)
| ID | Where to see it | What Code built |
|---|---|---|
| G31 NEW | Create a quiz (blank, template or a copy) | The first web address is the name as a slug and an eight digit number, for example `contact-form-89101273`, so it is hard to guess. The owner can change it in Quiz settings |
| G32 NEW | Share a quiz link (WhatsApp, Telegram, Facebook, X) | The link card shows the quiz's own title and words from its Start page (or "N questions · about 2 minutes. Tap to start." when it has none), and a picture: white card with the title, the length, a "Start the quiz" button and either the Start page's own picture (right side) or a dark panel with the number of questions. The "quiz" wordmark is hidden when the owner's plan hides "Powered by Quiz". The website's own share picture was redone with a small quiz page next to the promise. Built in Inter. WhatsApp remembers a link's preview for days: test with a link it has not seen |
| G8 NEW | `/dashboard` after the `/dev` button "Body Reset: 500 responses" | Card with a grey pill "Full" and "It reached 500 responses. People see that it is closed." No "Copy link" button and no Open/Close in its menu. "Full" follows the person's plan limit |
| G13 to G16 GUESS | `/dashboard` | Rename dialog (like New quiz); "A copy of a quiz I already have" has a quiz dropdown; the usage meter is a popover on "3 of 5 quizzes · Free plan"; toasts: Link copied, Quiz renamed / duplicated / closed / opened / deleted, a generic error, "Check your email" on the phone gate |

### H3. Editor
| ID | Where to see it | What Code built |
|---|---|---|
| G1 NEW | Editor, with the `/dev` switch "Next editor save says changed somewhere else" on, then edit anything | A dialog that cannot be closed: "This quiz was changed somewhere else" with "Load the newest" (drops what is on this screen) and "Keep my version" (saves this screen on top). Nothing is overwritten until the person chooses |
| G2 / G20 GUESS | Editor, Edit with AI, paste the quiz back | A small "Nothing would change" message with Back |
| G3 GUESS | Editor, Add a picture | The picture library only grows: no delete or rename (decision: not in v1) |
| G4 / G17 / G19 GUESS | Editor | Blocked-move toast "That move would make a condition look at a later page."; a page with no title shows its kind; heading "Edit last page"; the Day / Month / Year answer box; field errors for title, message, number range, button text and condition order; web address errors other than "taken"; "Change" and "Remove" on a picture |
| G26 NEW | Editor, Quiz settings, typing the web address very fast (more than 30 checks in a minute) | The live "is this address free" check stops quietly and the spinner goes away; typing again asks again. No message (decision D11 limit of 30 checks a minute) |
| G27 NEW | Editor, Quiz settings, typing a new web address in a **published** quiz | While the check runs the field is locked and a spinner says "Checking if this address is free…". A free address does **not** take effect: the line says "That address is free. It starts working when you publish.", the header counts it as a change ("1 change not published") and Publish changes becomes pressable. The Publish dialog adds "The web address changes to /quiz/xxx. Links you already shared will stop working." and, after Publish, the live dialog shows the new link. A quiz that was never published still takes the new address at once. The waiting address is kept in the editor only (lost on reload) |
| G28 NEW | Editor, Add a page | A new page starts with words so nothing is red: question "Question" with answers "Option 1" and "Option 2"; a text question "Question"; a number page asks "How old are you?" and follows its kind ("How tall are you?", "How much do you weigh?", "Enter a number", "Pick a date") until the owner edits it; Welcome "Welcome", Info "Good to know", Loading "Getting your results ready" with one step |
| G18 GUESS | Editor of a never-published quiz, Publish | "Publish your quiz?" with "Your quiz has N pages." |

### H4. Responses and account
| ID | Where to see it | What Code built |
|---|---|---|
| G21 GUESS | Responses, Summary and Individual | No match in the Individual search; the "Removed questions" group in Summary; the toast after "Delete all responses" |
| G6 NEW | `/account` (in the dummy data press Connect first) | When Google is connected and the person has a password: button "Disconnect" and a question "Disconnect Google?" ("From now on you log in with your email and password. You can connect Google again any time."), then the toast "Google disconnected". **Limit:** a person who began with Google and later set a password cannot disconnect (Supabase keeps an account's last sign-in method), so their row stays "Connected" |
| G30 NEW | Account menu (top right) → "Send feedback" | A dialog with one message box (up to 3000 characters). Only logged-in people can send it. It is saved in `contact_messages` (topic "Feedback") and emailed to the owner with the person as reply-to; at most 5 an hour. After sending the dialog says "Thank you". Not in the phone menu |
| G22 GUESS | `/account` | A new email is typed and sent with Enter or by leaving the field; a wrong-email message; "Set a password" for a Google-only account |

### H5. Admin
| ID | Where to see it | What Code built |
|---|---|---|
| G7 NEW | `/admin/users?filter=near-limit` (log in as admin) | A fourth filter "Near a limit" (80% of a Free limit). The Overview counter "Close to a Free plan limit" opens it |
| G24 GUESS | `/admin`, a person on the Free plan, a person that does not exist | The Free state of the Plan card; "They" instead of "She/her"; limit-box error; empty search; toasts; loading and failed cards; "Person not found"; notes save when the box loses focus; "Newest people" shows Today / Yesterday / a date |

### H6. The quiz people take
| ID | Where to see it | What Code built |
|---|---|---|
| G23 GUESS | `/quiz/body-reset`, Try it | Messages for a required text, phone and number; the helper line for a number with only a minimum or maximum; a single-choice question that is not required shows Continue; Loading has no Back; a white screen while the quiz opens; "Close preview" goes to the editor; a picture on an End page shows under the text |
| G29 NEW | `/quiz/<address>`, any quiz | Continue and Start show the next page at once; the answer is saved in the background. If a save fails, "We couldn't save your answer" with Try again appears. The last page still waits for its save before "Thank you". The buttons and answer tiles got a hover and a press effect |
| G25 GUESS | A quiz changed after someone started; `/maintenance` | No board for "Welcome back" when the quiz changed (answers to removed pages are kept but not shown). The maintenance page is used as is for maintenance mode |

### H7. Approved by you, not drawn yet
| ID | What the code does | What the boards still show |
|---|---|---|
| D1 | Every email link lasts **1 hour** (verify screens and the verify email say so). The email-change link stays 24 hours | `VerifySent`, `VerifyExpired`, `EmailVerify` say 24 hours |
| D2 | A Google login joins an existing account with the same email. The screen "Log in: Google, account exists" is gone | Two boards `LoginGoogleExists` (desktop, phone) and a rule in `BehaviorRules` |

---

## I. Manual test list for the owner (what Code cannot do for you)

> Test on `https://quiz.basrh.com` after each deploy. Tick a line when it worked. If something is wrong, send Code a screenshot and the number of the line.

**Already tried by the owner on 2026-11-09 (worked):** register with email and password, the verify email arrives in a real inbox and its link works, Cloudflare check shows on Register, log in with Google, set a password on a Google account, create a quiz from a template, publish it and answer it (the response is recorded), the Contact form (the email arrives in the owner's inbox), Edit with AI (worked after a second round; fixed since).

**To test:**
- [ ] I1. Forgot password: ask for the email, open the link, set a new password, log in with it, and look for the "Your Quiz password was changed" email
- [ ] I2. Account: change the name; change the password with the current one (a wrong current password must be refused); change the email (the link goes to the NEW address, the old one still works until it is confirmed); delete the account at the end (type DELETE)
- [ ] I3. Admin: log in as `cloudteamize@gmail.com`, open the menu → Admin: Overview numbers, Users, open a person, change a plan and limits, suspend and restore someone (use a throwaway account), look for "Near a limit"
- [ ] I4. Quiz list: create 5 quizzes and see the "5 of 5" limit dialog on the sixth; rename, duplicate, close and open, delete; a closed quiz shows the closed message to people
- [ ] I5. Editor: every page type (welcome, choice with several answers, text with email and phone, number and date, info, loading, end with a button); drag to reorder; a display condition ("show this page only if…"); add a picture to a page and to answers (it must show in the public quiz); undo; Edit with AI again with the new prompt (`Copy for AI`)
- [ ] I6. Publish flow: publish; change the web address (it must wait for Publish and the old link keeps working until then); the Share dialog shows the new link; "Quiz settings → Accepting responses" off and on
- [ ] I7. Take the quiz as a visitor on a **phone** (iPhone Safari and an Android browser): Continue must feel instant, the progress bar, a required question refuses an empty answer, "Welcome back" after closing the tab halfway, "Take it again" after finishing. Also with Wi-Fi turned off on the last page (must say it could not save and offer Try again)
- [ ] I8. Responses: Summary numbers match what you answered, Individual (search, delete one), download CSV, XLSX and JSON and open them, Delete all (type DELETE)
- [ ] I9. Emails on a phone and in Gmail: verify, password changed, new address, contact (the layout must look right, the buttons must work, none in spam)
- [ ] I10. Share a quiz link in WhatsApp or Telegram: the preview card (title, words, picture) must appear. Use a link WhatsApp has never seen (a new quiz), because it keeps old previews. To force a refresh of an old link, add `?v=2` to it. Also try a quiz whose Start page has a picture
- [ ] I11. Feedback: Account menu → Send feedback; the message must arrive in your inbox with the sender as reply-to
- [ ] I12. Keyboard only (Tab, Enter, Space, Esc) through register, a quiz and the editor; screen reader on one quiz if you can
- [ ] I13. Log in with a wrong password 5 times: the account locks for a while and says so; a suspended account cannot log in
- [ ] I14. Other browsers: Firefox and Safari on the website and a public quiz (Code can also run Firefox and WebKit with Playwright if you allow the download)
