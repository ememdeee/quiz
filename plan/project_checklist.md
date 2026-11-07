# Checklist (status of the whole project)
> Last Updated: 2026-11-07
> This is the short, owner-friendly status list. The details of every task are in `project_handover.md` (section 12). **Both files are updated together, in the same session.** When a task is finished: tick it here AND in the handover. When a new task, decision or gap appears: add it to both.
> Legend: `[x]` done, `[ ]` not done. "Owner" = needs Muhammad. "Code" = Claude Code does it.

---

## A. Now (current phase)
- Current phase: **Phase 3** (database done on `quiz-dev`; the UI work in Phase 2 continues in another session)
- Next action: owner reviews branch `phase-3-supabase` and says whether to push it. Then Phase 4 (auth) needs a Google Cloud OAuth client and a Mailtrap sandbox from the owner. Owner still answers D1 and D2 (D1 working default 1 hour is set in config).
- UI track (Phase 2): dashboard (slices A to D), the quiz runtime, the admin area and the email templates are done. Left in Phase 2: the dev session switcher links (2.0b), the link audit spec and fidelity review (2.12), the Vercel preview (2.13), then "UI approved".

## B. Design (Claude Design artifact: https://claude.ai/artifact/FiiBUq7uJaBcXyeqfTKtTw)
- [x] All screens designed (158 boards, version 69 on 2026-11-07; v69 = FAQ full width, FAQ phone padding, Copy link spacing on Home and Pricing)
- [x] Behavior rules board "How the quiz behaves" written
- [ ] Design gaps closed (handover 13.1): G1 conflict dialog, G2 AI "no changes", G3 picture library note, G4 blocked-move toast, G5 email-change landing, G6 disconnect Google, G7 admin near-limit link, G8 "Full" on quiz card
- [ ] Decisions needing a design change: D1 (link lifetimes), D2 (Google already exists)

## C. Owner tasks (accounts and things only the owner can do)
- [x] GitHub repo https://github.com/ememdeee/quiz (public, exists)
- [x] ~~Docker~~ not needed (decided 2026-11-07)
- [x] Supabase project `quiz-dev` created (Singapore, Free). One project is enough for now
- [x] Mailtrap sandbox account (test inbox, D20) (done 2026-11-07, free: 50 emails per month)
- [x] Supabase keys put in `.env.local` (never in chat)
- [x] Google Cloud OAuth client (for Google login) (dev client `quiz-dev` done 2026-11-07, provider enabled in Supabase; production client later, Phase 16)
- [ ] Vercel account, repo connected
- [ ] Domain: use `quiz.basrh.com` (D9 decided, no purchase); still needs DNS access to `basrh.com` and the records added
- [ ] Resend account + DNS records added
- [ ] Cloudflare Turnstile keys
- [ ] Sentry project
- [ ] Legal details for Terms and Privacy + lawyer review
- [ ] Supabase production project on a paid plan
- [ ] Owner account promoted to admin (SQL line from Code)

## D. Decisions (handover section 11)
- [x] D1 link lifetimes = 1 hour for all (approved 2026-11-07; design change pending)  - [x] D2 Google linking = accept auto-link (approved 2026-11-07; design change pending)  - [ ] D3 slug holds 30 days
- [ ] D4 picture quota (rec: none)  - [ ] D5 noindex rules  - [ ] D6 analytics tool  - [ ] D7 Vercel paid plan
- [x] D8 region (Singapore)  - [x] D9 domain (`quiz.basrh.com`)  - [ ] D10 custom domains later  - [ ] D11 rate limits  - [ ] D12 reserved slugs
- [x] D20 Mailtrap for dev emails  - [ ] D21 what stays in the public repo  - [ ] D13 "near limit" = 80%  - [ ] D14 Resend  - [ ] D15 keep contact messages  - [ ] D17 condition sources  - [ ] D18 blocked reorder  - [ ] D19 admin response count

## E. Build phases (handover section 12)
- [ ] **Phase 0** Accounts, repo, decisions
- [ ] **Phase 1** Clean-up and foundation (tooling, tokens, shared logic with unit tests)
- [ ] **Phase 2** Whole UI with dummy data, all links connected, owner says "UI approved"
  - [x] UI kit  - [ ] layouts and shared components (site, sign-in, dashboard, quiz and admin done)  - [x] website  - [x] auth screens  - [x] quiz list and new quiz (Slice A, 2026-11-07; "Full" card state waits for design G8)
  - [x] editor (Slices B and C, 2026-11-07: all page types, conditions, publish, share, settings, pictures, Edit with AI)
  - [x] quiz runtime (2026-11-07: `/quiz/[slug]` and Try it, all states, resume, save error; wording with no board is G23)
  - [x] responses (summary, individual, export, delete)  - [x] account  - [x] admin (2026-11-07: Overview, Users, one person, dialogs, no-access; wording with no board is G24)  - [x] email templates (2026-11-07: five emails and `/dev/emails`; sender address is a guess)
  - [ ] link audit passes  - [ ] staging preview deployed
- [ ] **Phase 3** Supabase, database, security rules, tests: database, RLS, storage and 115 tests DONE (2026-11-07, branch `phase-3-supabase`); left: `repos/supabase` skeletons, optional dev seed
- [ ] **Phase 4** Register, login, accounts base (real auth)
- [ ] **Phase 5** Quizzes and editor for real (autosave, publish, slug check, limits)
- [ ] **Phase 6** Pictures (media library)
- [ ] **Phase 7** Public quiz and saving answers
- [ ] **Phase 8** Responses: summary, individual, export, delete
- [ ] **Phase 9** Edit with AI for real (prompt updated to the final format)
- [ ] **Phase 10** Account settings complete
- [ ] **Phase 11** Admin area
- [ ] **Phase 12** Email for real (Resend, domain, templates, contact form)
- [ ] **Phase 13** Website completion (copy, SEO, analytics, final legal)
- [ ] **Phase 14** Hardening (spam, rate limits, headers, monitoring, backups, performance, accessibility)
- [ ] **Phase 15** Full QC run, bug fixing, cleanup
- [ ] **Phase 16** Release to production, first week watch

## F. QC scripts (handover 14.4). Each must be written AND passing
- [ ] QC-01 website  - [ ] QC-02 register and verify  - [ ] QC-03 login, lock, reset  - [ ] QC-04 create quizzes
- [ ] QC-05 edit  - [ ] QC-06 conditions  - [ ] QC-07 pictures  - [ ] QC-08 publish and share  - [ ] QC-09 slugs, two people
- [ ] QC-10 take a quiz (phone)  - [ ] QC-11 responses and downloads  - [ ] QC-12 limits  - [ ] QC-13 isolation between people
- [ ] QC-14 account  - [ ] QC-15 Edit with AI  - [ ] QC-16 admin  - [ ] QC-17 emails  - [ ] QC-18 accessibility
- [ ] QC-19 security  - [ ] QC-20 performance  - [ ] QC-21 production smoke
- [x] Database tests pass (Vitest, `npm run test:db`)  - [ ] Unit tests pass  - [ ] Manual checks done (real Google login, real email, real phones, screen reader)

## G. Release gate (all must be true before production)
- [ ] `npm run release-check` green twice in a row
- [ ] Staging QC green
- [ ] Design fidelity review done (every board vs screen)
- [ ] Backups on and restore drill worked
- [ ] Real domain, email domain verified, legal texts final, placeholders removed
- [ ] Production smoke (QC-21) passed after deploy
