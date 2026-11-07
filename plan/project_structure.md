# Project Structure
> Last Updated: 2026-11-08
> Rewritten for the redesigned product. The old app (BodyReset, GTM and Meta Pixel, timed pages, Gumroad) is gone from the code; only git history keeps it.
> The plan and the rules live in `project_handover.md`. This file says **where things are**.

---

## What it is

A simple quiz maker for people who are not technical (a Google Forms replacement): people build a quiz from pages, share one link, and read the answers. Free plan: 5 quizzes, 15 pages each, 500 finished responses each. The Custom plan is set by the admin per person.

Stack: Next.js 15 (App Router), React 19, TypeScript strict, Tailwind v4, Radix pieces, Zustand + Immer for the editor, Zod, Supabase (Postgres, Auth, Storage), React Email, Vitest, Playwright.

## The data switch (the most important idea)

Screens never talk to a database. They call **repositories** (`src/server/repos/ports.ts`) through hooks. One variable picks what answers:

| `NEXT_PUBLIC_DATA_MODE` | What answers | Used for |
|---|---|---|
| unset or `mock` | the browser mock (`repos/mock/*`, dummy data in localStorage, cookie session) | building and testing the UI, the link audit |
| `supabase` | server actions and public endpoints on Supabase (`repos/remote/*`) | the real product |

Both follow the same rules because they use the same `lib/` functions (limits, slugs, validation, conditions).

## Folders

```
emails/                  The five emails (React Email): layout, verify, new-address, reset, password-changed, contact, index
plan/                    The plan files (handover, checklist, structure, tracking, business)
scripts/                 with-env.mjs (runs a command with .env.local), export-auth-emails.tsx
supabase/                config.toml, migrations/ (7 files), templates/ (auth email HTML made from emails/)
tests/db/                Database tests (RLS, limits, storage, cascades) against the dev project: npm run test:db
tests/mail/              Email delivery check through the Mailtrap test inbox: npm run test:mail
tests/qc/                Browser tests (Playwright): link audit on the mock app, real-* specs on Supabase
src/app/
  (site)/                Home, Pricing, Contact, Terms, Privacy, Maintenance (website layout)
  (auth)/                Register, Log in, Forgot/Reset password, Verify email screens (split layout)
  (app)/                 Dashboard (quiz list, editor, responses, settings) and Account; needs a login
  (admin)/               Admin overview, users, one person; admins only, everyone else sees "no access"
  (preview)/             "Try it" for one quiz, outside the dashboard frame
  quiz/[slug]/           The quiz people answer
  auth/                  confirm (email links), callback (Google), email-change/confirm
  api/q/*, api/r/*       Public endpoints for answering a quiz (no account, secret token per response)
  api/health             Uptime check
  dev/                   Test links, UI kit, templates, emails preview. Does not exist in a production build
src/components/
  ui/                    The UI kit (Button, Field, Dialog, Menu, Table, Toast, Pill, ...)
  layout/ marketing/     Website pieces and the account menu
  auth/ account/         Sign-in screens, account page
  dashboard/ editor/     Quiz list, the editor (page list, canvas, panels, dialogs, Edit with AI)
  responses/             Summary, Individual, export, delete dialogs
  quiz-runtime/          The quiz as people take it (also used by Try it)
  admin/                 Overview, users, person page, dialogs
src/lib/
  quiz/                  schema, page-type registry, conditions, validate, diff, runner (the rules of "How the quiz behaves"),
                         progress (what the server accepts), templates, calendar, theme, pictures
  ai/                    Edit with AI: prompt, export, import
  responses/             summarize, individual filters, exports (CSV, XLSX, JSON)
  plan/limits.ts         Free limits and per-person overrides
  admin/                 People list logic (search, filters, overview numbers, CSV)
  routes.ts  env.ts  errors.ts  slug.ts  format.ts  validation.ts  auth-rules.ts  media-url.ts
src/server/
  actions/               Server actions: auth, quizzes, media, responses, account, admin, contact, preview, dashboard, session
  auth/                  guards (who may act), lockout (5 tries / 15 minutes), mock and real sign-in
  public/                The public quiz API logic (load, open, start, answer, finish, resume) and its HTTP helpers
  supabase/              server (the person's own rights), admin (service key), middleware helper
  email/send.ts          One way every email leaves: Resend, else the Mailtrap test inbox, else skipped
  repos/                 ports.ts (the shapes), index.ts (the switch), mock/, remote/
  session.ts             Who is logged in (mock cookie or Supabase)
src/middleware.ts        Maintenance switch, session refresh, sends strangers from private pages to Log in with `next`
src/content/             All fixed English text of the screens (one place for strings)
src/data/mock/           Dummy data
src/store/               The editor store (Zustand + Immer, undo)
src/types/database.ts    Generated from the database (supabase gen types)
```

## Routes

Website: `/`, `/pricing`, `/contact`, `/terms`, `/privacy`, `/maintenance`.
Sign-in: `/register`, `/login`, `/forgot-password` (+ `/sent`), `/reset-password` (+ `/done`, `/expired`), `/verify-email` (+ `/done`, `/expired`), `/goodbye`.
Signed in: `/dashboard`, `/dashboard/[quizId]` (editor), `/dashboard/[quizId]/responses`, `/dashboard/[quizId]/settings`, `/dashboard/[quizId]/preview`, `/account`.
Admin: `/admin`, `/admin/users`, `/admin/users/[userId]`.
People answering: `/quiz/[slug]`.
Server routes: `/auth/confirm`, `/auth/callback`, `/auth/email-change/confirm`, `/api/q/[slug]` (+ `/open`, `/start`), `/api/r/[id]/answer`, `/finish`, `/resume`, `/api/health`.
Every URL string lives in `src/lib/routes.ts`.

## Rules that keep it clean

- One place for each thing: routes (`routes.ts`), words (`content/`), colors (tokens in `design-system.css`), page types (the registry in `lib/quiz/page-types/`), limits (`plan/limits.ts`).
- Server code starts with `import "server-only"` (actions are `"use server"` and export only async functions).
- The service-role client (`supabase/admin.ts`) is used only after the code has checked who is asking: public quiz answers, the admin area, the sign-in lock, emails changes.
- Nothing from a browser is trusted: public answers are checked against the PUBLISHED quiz and the saved texts come from it (`lib/quiz/progress.ts`).
- Secrets are only in `.env.local` (never committed). `.env.example` lists every name.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | The app with the browser mock (or set `NEXT_PUBLIC_DATA_MODE=supabase` for the real data) |
| `npm test` | Unit tests (`src/**`, `emails/**`) |
| `npm run test:db` / `db:check` | Database tests and the row-level-security check against the dev project |
| `npm run test:mail` | Sends one test email through Supabase into the Mailtrap inbox |
| `npm run qc:links` | The link audit: every page, link and button as visitor, person and admin |
| `npm run qc:real` | The browser tests on Supabase: sign-in, quizzes, answering, account, admin, contact |
| `npm run emails:export` | Rebuilds `supabase/templates/*.html` from `emails/` |
| `npm run release-check` | Everything that must be green before production: lint, typecheck, unit tests, build |
