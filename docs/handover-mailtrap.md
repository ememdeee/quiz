# Handover: Mailtrap sandbox for development emails (decision D20)
> Written 2026-11-07. Owner: Muhammad Basurah. The owner is a beginner: explain every step in simple Indonesian, **one small step at a time**, and say exactly where to click. Ask for a screenshot when a screen differs from what you expect.
> Goal of this session: Supabase Auth sends its emails (verify, reset, etc.) over SMTP to a **Mailtrap sandbox inbox**, and a script can read those emails through the Mailtrap API. **Nothing else.** No screens, no email templates (that is Phase 12).

## 0. How to start (token-saving rules)
1. Read only: this file, `plan/project_checklist.md`, and from `plan/project_handover.md` sections **8.12** (emails), **10** (what the owner provides) and **11** (only D1 and D20), plus **14.7** (how QC runs). Do not read the rest. For this session follow this point instead of the "read all plan files" rule in `CLAUDE.md`.
2. Do not touch `src/app`, `src/components`, `src/content`, `src/lib/ui`. You may create or edit: `supabase/config.toml`, `.env.example`, `tests/mail/**` (new), `docs/**`, `package.json` (only what you need), and the status lines in `plan/project_checklist.md` and `plan/project_handover.md`. Another session may be editing the website in the same folder.
3. Git: the database work is on branch `phase-3-supabase` (not pushed). Start with `git switch phase-3-supabase` then `git switch -c phase-4-mailtrap`. Commit often. **Do not push** until the owner says so.
4. The repo is **public**. Never write a secret (SMTP password, API token) in a committed file, in chat, or in a log. Never print an environment variable value. The owner pastes secrets into `.env.local`.
5. CLI notes (no Docker): use `--remote`; run commands through `node scripts/with-env.mjs <command>` so `.env.local` loads exactly as written; use `--yes` for non-interactive hosted changes.

## 1. What is already decided or done
- Supabase dev project: ref `ubyfseqdzzuixvxmabfe`, linked. `supabase/config.toml` already has: confirm email **on**, password minimum 8, `double_confirm_changes = false`, `otp_expiry = 3600`.
- **D1 is approved by the owner (2026-11-07):** all email links (verify and reset) last **1 hour**. Supabase has one lifetime for all of them. `otp_expiry = 3600` is already pushed. (Update 2026-11-08: the code and the verify email now say "1 hour" themselves; the boards still say "24 hours" and are owed an update, see `plan/project_checklist.md` H7.)
- Why Mailtrap: no Docker, so no local mail catcher. Mailtrap is a **fake inbox on the internet**: the emails land there and nobody real receives them, so tests can sign up fake people safely and read the verification link.
- Supabase's built-in email service is limited (few emails per hour, only to team members); with our own SMTP it is much more flexible. Production uses Resend later (Phase 12), not Mailtrap.

## 2. Steps for the owner (guide one at a time)
1. Go to https://mailtrap.io and create a free account (log in with Google is fine).
2. In the left menu open **Email Testing** (also called Sandbox) and create an **Inbox** (or use the default "My Inbox") named `quiz-dev`. Check the current free limits shown on the page (decision D20 asks to check them) and tell the owner in one line.
3. Open the inbox, tab **SMTP Settings** (or "Integrations"). Show the fields: **Host, Port, Username, Password**. The owner copies them into `.env.local` (step 3.1). Never into chat.
4. API access for the test scripts: Mailtrap **Settings, API Tokens, Add token** (name `quiz-qc`, permission to read the inbox `quiz-dev`). The owner copies the token into `.env.local`. Also note the **Account ID** and the **Inbox ID** (visible in the URL of the inbox, for example `.../inboxes/123456/messages`, and in the API docs page). Those two numbers are not secret.
5. Tell the owner to close `.env.local` and not share it.

## 3. Your work (Claude Code)
1. Add to `.env.example` (names only): `MAILTRAP_SMTP_HOST=`, `MAILTRAP_SMTP_PORT=`, `MAILTRAP_SMTP_USER=`, `MAILTRAP_SMTP_PASS=`, `MAILTRAP_API_TOKEN=`, `MAILTRAP_ACCOUNT_ID=`, `MAILTRAP_INBOX_ID=`. Open `.env.local` for the owner (`open_in_editor`), let them paste the values, then check only that each variable is non-empty (booleans, never values).
2. In `supabase/config.toml` enable custom SMTP with environment substitution (check the real key names in the existing file; the section is `[auth.email.smtp]`):
   ```
   [auth.email.smtp]
   enabled = true
   host = "env(MAILTRAP_SMTP_HOST)"
   port = 2525            # use the port shown by Mailtrap (the file wants a number)
   user = "env(MAILTRAP_SMTP_USER)"
   pass = "env(MAILTRAP_SMTP_PASS)"
   admin_email = "no-reply@example.test"
   sender_name = "Quiz (dev)"
   ```
   The port cannot come from an env var if the config key is numeric: ask the owner for the port number from Mailtrap and write it in the file (the port is not secret). Do not change other auth settings.
3. `node scripts/with-env.mjs npx supabase config push --yes`. Read the printed diff: only the SMTP section should change. Never print secrets.
4. Show the owner where to see it: Supabase dashboard, **Authentication, Emails (or Settings), SMTP Settings** (enabled, host filled, password hidden).
5. **Real test (no website needed):** write `tests/mail/mailbox.ts` (small helper using `fetch` and the Mailtrap API: list messages of the inbox, read one, delete all) and `tests/mail/smtp.check.ts` that:
   - calls `supabase-js` `auth.signUp` for a fake `qc-<random>@example.test` person with the publishable key (this makes Supabase send a verify email through SMTP),
   - polls the Mailtrap inbox (up to ~30 s) for a message to that address,
   - checks the subject exists and the body contains a link to `supabase.co/auth/v1/verify`,
   - deletes the fake person afterwards (Auth admin API with the service role) and cleans the inbox.
   Refuse to run unless `NEXT_PUBLIC_SUPABASE_URL` contains `ubyfseqdzzuixvxmabfe` (same guard as `tests/db/env.ts`; reuse its `loadEnv` and `assertDevProject`). Add an npm script `test:mail` (use `node --experimental-strip-types --no-warnings`, like `db:check` in `package.json`). Free Mailtrap and Supabase have rate limits, so run the test sparingly and say so.
6. Update status: in `plan/project_checklist.md` tick "Mailtrap sandbox account" (section C) and D20; in `plan/project_handover.md` update section 10 and Phase 4 text (what is done: SMTP + mailbox helper + test). Update `Last Updated`. Commit on the branch.
7. Report to the owner in Indonesian, short: what works, anything unexpected (Mailtrap limits, sign-up rate limits), next step. Ask before pushing.

## 4. Explain to the owner in simple words (when it comes up)
- **SMTP** = the "mail truck" address: the server that delivers our emails. We give Supabase the Mailtrap address, so every email goes to the fake inbox.
- **Sandbox inbox** = a mailbox that catches everything. We open it to click the verify link like a real person would. Nothing reaches real people.
- Why we need the API token: our automatic tests need to read the email by themselves.
- Production (Phase 12) will use Resend with the real domain; Mailtrap is for development and tests only.

## 5. Done when
- Mailtrap account and inbox `quiz-dev` exist; `.env.local` has the values (never printed); `.env.example` lists the names.
- `config push` applied; the SMTP section shows enabled in the Supabase dashboard.
- `npm run test:mail` passes: a sign-up email arrives in the sandbox and contains the verify link; the fake person and the inbox are cleaned up.
- Plan files updated; committed on the branch, not pushed.

## 6. Do not
- Do not send emails to real addresses, do not enable email in production settings, do not create a second Supabase project.
- Do not write email templates or touch website code or design.
- Do not enable SMTP by clicking in the dashboard when `config.toml` can do it (the code is the source of truth).
