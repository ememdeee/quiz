# Checklist (status of the whole project)
> Last Updated: 2026-11-07
> This is the short, owner-friendly status list. The details of every task are in `project_handover.md` (section 12). **Both files are updated together, in the same session.** When a task is finished: tick it here AND in the handover. When a new task, decision or gap appears: add it to both.
> Legend: `[x]` done, `[ ]` not done. "Owner" = needs Muhammad. "Code" = Claude Code does it.

---

## A. Now (current phase)
- Current phase: **Phase 0** (accounts, repo, decisions)
- Next action: owner creates the accounts in section C, and answers decisions D1 and D2.

## B. Design (Claude Design artifact: https://claude.ai/artifact/FiiBUq7uJaBcXyeqfTKtTw)
- [x] All screens designed (158 boards, version 67 on 2026-11-07)
- [x] Behavior rules board "How the quiz behaves" written
- [ ] Design gaps closed (handover 13.1): G1 conflict dialog, G2 AI "no changes", G3 picture library note, G4 blocked-move toast, G5 email-change landing, G6 disconnect Google, G7 admin near-limit link, G8 "Full" on quiz card
- [ ] Decisions needing a design change: D1 (link lifetimes), D2 (Google already exists)

## C. Owner tasks (accounts and things only the owner can do)
- [ ] GitHub account, private repo named `quiz`
- [ ] Docker Desktop installed (with WSL2)
- [ ] Supabase account + staging project `quiz-staging` (region chosen, D8)
- [ ] Supabase keys put in `.env.local` (never in chat)
- [ ] Google Cloud OAuth client (for Google login)
- [ ] Vercel account, repo connected
- [ ] Real domain bought (D9) and DNS access
- [ ] Resend account + DNS records added
- [ ] Cloudflare Turnstile keys
- [ ] Sentry project
- [ ] Legal details for Terms and Privacy + lawyer review
- [ ] Supabase production project on a paid plan
- [ ] Owner account promoted to admin (SQL line from Code)

## D. Decisions (handover section 11)
- [ ] D1 link lifetimes (rec: 1 hour for all)  - [ ] D2 Google linking (rec: accept auto-link)  - [ ] D3 slug holds 30 days
- [ ] D4 picture quota (rec: none)  - [ ] D5 noindex rules  - [ ] D6 analytics tool  - [ ] D7 Vercel paid plan
- [ ] D8 region  - [ ] D9 domain  - [ ] D10 custom domains later  - [ ] D11 rate limits  - [ ] D12 reserved slugs
- [ ] D13 "near limit" = 80%  - [ ] D14 Resend  - [ ] D15 keep contact messages  - [ ] D17 condition sources  - [ ] D18 blocked reorder  - [ ] D19 admin response count

## E. Build phases (handover section 12)
- [ ] **Phase 0** Accounts, repo, decisions
- [ ] **Phase 1** Clean-up and foundation (tooling, tokens, shared logic with unit tests)
- [ ] **Phase 2** Whole UI with dummy data, all links connected, owner says "UI approved"
  - [ ] UI kit  - [ ] layouts and shared components  - [ ] website  - [ ] auth screens  - [ ] quiz list and new quiz
  - [ ] editor (all page types, conditions, publish, share, settings, media dialog, Edit with AI)  - [ ] quiz runtime
  - [ ] responses (summary, individual, export, delete)  - [ ] account  - [ ] admin  - [ ] email templates
  - [ ] link audit passes  - [ ] staging preview deployed
- [ ] **Phase 3** Supabase local, database, security rules, pgTAP tests
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
- [ ] Database (pgTAP) tests pass  - [ ] Unit tests pass  - [ ] Manual checks done (real Google login, real email, real phones, screen reader)

## G. Release gate (all must be true before production)
- [ ] `npm run release-check` green twice in a row
- [ ] Staging QC green
- [ ] Design fidelity review done (every board vs screen)
- [ ] Backups on and restore drill worked
- [ ] Real domain, email domain verified, legal texts final, placeholders removed
- [ ] Production smoke (QC-21) passed after deploy
