# Checklist (status of the whole project)
> Last Updated: 2026-11-08
> This is the short, owner-friendly status list. The details of every task are in `project_handover.md` (section 12). **Both files are updated together, in the same session.** When a task is finished: tick it here AND in the handover. When a new task, decision or gap appears: add it to both.
> Legend: `[x]` done, `[ ]` not done. "Owner" = needs Muhammad (an account, a key, a decision). "Code" = Claude Code does it.

---

## A. Now
- **All the code is built.** Every screen, the whole backend on Supabase (login, quizzes, pictures, answering, responses, account, admin, contact, emails), the tests, CI and the runbooks. What is left is mostly **yours** (accounts and decisions), listed in B, C and D below.
- Branch `phase-2-ui` holds everything (it already includes the database branch and the Google/Mailtrap branch). It is **not pushed** and not merged into `main`: open a pull request when you are ready.
- The most useful next steps for you, in order: (1) run `node scripts/with-env.mjs npx supabase config push` once (it only changes the two auth emails and turns on "connect Google"; the CLI shows the change and asks); (2) create the Vercel project and send the preview link; (3) decide the open design gaps in B (G1 to G8, G23, G24) and D1/D2 in Claude Design; (4) the accounts in C for launch.
- Run everything yourself any time: `npm run release-check`, `npm run test:db`, `npm run qc:links`, `npm run qc:a11y`, `npm run qc:real`, `npm run qc:prod`.

## B. Design (Claude Design artifact: https://claude.ai/artifact/FiiBUq7uJaBcXyeqfTKtTw)
- [x] All screens designed (158 boards, version 69)
- [x] Behavior rules board "How the quiz behaves" written
- [ ] Design gaps closed (handover 13.1): G1 conflict dialog, G2 AI "no changes", G3 picture library note, G4 blocked-move toast, G5 email-change landing, G6 disconnect Google, G7 admin near-limit link, G8 "Full" on quiz card. Also G23 (quiz runtime wording) and G24 (admin wording and states). Code built a sensible version of each; the owner confirms or changes it in Design.
- [ ] Decisions needing a design change: D1 (link lifetimes), D2 (Google already exists)

## C. Owner tasks (accounts and things only the owner can do)
- [x] GitHub repo https://github.com/ememdeee/quiz (public)
- [x] Supabase project `quiz-dev` (Singapore, Free)
- [x] Mailtrap sandbox (test inbox), Supabase keys in `.env.local`, Google OAuth dev client
- [ ] **Run `config push`** (see A) so the designed verify and reset emails and "connect Google" go live on the dev project
- [ ] Vercel account, repo connected (then the preview deploy, handover 2.13)
- [ ] DNS access to `basrh.com` for `quiz.basrh.com` and the email records
- [ ] Resend account + DNS records (SPF, DKIM, DMARC); then `RESEND_API_KEY`
- [ ] Cloudflare Turnstile keys (site key and secret)
- [ ] Sentry project (DSN)
- [ ] Legal details for Terms and Privacy + lawyer review
- [ ] Supabase production project on a paid plan (daily backups), then the restore drill
- [ ] Owner account promoted to admin on production (SQL in `docs/runbooks/admin.md`)
- [ ] Try Edit with AI with real ChatGPT / Claude / Gemini chats and report what fails
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
  - [x] responses  - [x] account  - [x] admin  - [x] email templates  - [x] session switcher link  - [x] link audit passes (`npm run qc:links`)  - [ ] staging preview deployed (needs Vercel)
- [x] **Phase 3** Supabase, database, security rules, tests (database tests incl. code-versus-database parity, row-level security check)
- [x] **Phase 4** Register, login, accounts base (real auth)
- [x] **Phase 5** Quizzes and editor for real (autosave, publish, slug check, limits)
- [x] **Phase 6** Pictures (media library)
- [x] **Phase 7** Public quiz and saving answers
- [x] **Phase 8** Responses: summary, individual, export, delete
- [x] **Phase 9** Edit with AI for real (the owner still tries real AI chats)
- [x] **Phase 10** Account settings (disconnect Google waits for its design, G6)
- [x] **Phase 11** Admin area
- [ ] **Phase 12** Email for real: code and tests done; needs the owner's Resend account, DNS and `config push`
- [ ] **Phase 13** Website completion: SEO, icons, share pictures, analytics, placeholders done; final copy and legal need the owner
- [ ] **Phase 14** Hardening: Turnstile, rate limits, security headers and policy, Sentry (off until its key), accessibility and performance checks done; backups drill, uptime monitor and audit need the owner's accounts
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
