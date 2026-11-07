# Handover: building the Quiz platform
> Last Updated: 2026-11-08
> Status: **Design is finished** (Claude Design artifact, 158 boards). **Website tab UI built 2026-11-07** (Phase 2.3 and 2.4, on mock data; the rest of the UI and the whole backend are not built). **Update 2026-11-08:** all code is built (UI on the mock, the whole backend on Supabase, tests, runbooks). Every design gap (G1 to G25) is also built, as a simple version **without a board** (owner decision, see R1 and 13.4); the owner designs them later. What is left is mostly the owner's: accounts, the Vercel preview check, designing what is in 13.4, legal text. The list that matters most is `project_checklist.md`, sections A and H.
> Owner: Muhammad Basurah (contact: basurah@basrh.com). Talk to the owner in Indonesian. All UI text is English.
> At the start of every session read sections 0, 1 and 12 (summary, rules, master checklist); read the other sections when you work on that area. Update the checklist in section 12 as work is done.

---

## 0. Ringkasan untuk pemilik (Bahasa Indonesia)

Ini dokumen serah-terima ke Claude Code. Isinya: aturan kerja, arsitektur, rancangan database Supabase, logika tiap fitur, urutan pengerjaan (Phase 0 sampai 16), rencana QC (script Playwright yang mengetes seperti user asli), dan daftar yang dibutuhkan dari kamu.

Inti rencananya:
1. **Aturan utama:** semua perubahan UI penting **dibuat dulu di Claude Design**, baru ke kode. Kode harus rapi: satu hal ditulis satu kali di satu tempat (komponen, string, route, aturan, validasi).
2. **Urutan:** (a) bersihkan kode lama dan buat fondasi, (b) bangun **seluruh UI dengan data dummy** sampai semua link tersambung, (c) baru backend: Supabase (database, login, penyimpanan gambar), lalu fitur satu per satu, (d) Edit with AI, admin, email, (e) QC script, (f) GitHub dan rilis ke Vercel.
3. **Kenapa import/export AI bisa jalan:** seluruh halaman satu quiz disimpan sebagai **satu dokumen JSON** (`quiz-v1`). Export = membaca dokumen itu. Import = memeriksa lalu menulis dokumen itu kembali. Tidak ada pemetaan rumit antar tabel.
4. **Banyak pengguna aman:** tiap tabel dilindungi aturan RLS Supabase, jadi orang hanya melihat quiz dan jawaban miliknya sendiri. Slug quiz unik di seluruh sistem dan dicek saat diketik.
5. **Yang perlu kamu siapkan:** lihat bagian 10 (akun, kunci, domain). Rahasia (kunci API) dimasukkan ke file `.env.local` sendiri, **jangan ditempel di chat dan jangan di-commit**.
6. **Keputusan yang masih terbuka** ada di bagian 11, masing-masing dengan rekomendasi.

---

## 1. The rules that never change

### R1. Design first (most important rule)
- The design source of truth is the **Claude Design artifact**: **https://claude.ai/artifact/FiiBUq7uJaBcXyeqfTKtTw** (private, owner's account). Always keep this link in this file.
- **Any UI change that is not very small must be designed in Claude Design first**, approved by the owner, and only then built in code. Code is never the first place a screen, state, field, flow or rule appears.
- **Minor (code may change directly, and must say so in the commit):** fixing a typo, nudging spacing by a few px, making code match the design, a bug fix that does not change what the person sees or does.
- **Not minor (design first):** a new screen, dialog, state, field, button, flow, rule or limit; a layout change; new wording that changes meaning; anything that changes what is saved.
- If code needs something that is not in the design (see section 13, "Known design gaps"): **stop, write down what is needed, ask the owner**, update the design, then build.
- **TEMPORARY EXCEPTION (owner, 2026-11-08):** this Claude account has no access to the Claude Design artifact, so Code cannot design there and must not wait. For anything missing from the design Code builds the **simplest sensible version directly in code** and writes it into the "NOT DESIGNED YET" list: `project_checklist.md` section H (owner-friendly), 13.4 below, and the dev page `/dev/undesigned`. Ugly is fine. The owner designs those later in Claude Design and Code then matches them. Everything else in R1 still holds: do not change a screen that **has** a board without the owner, and never leave an invented screen unlisted.
- After a design change: update the board **How the quiz behaves** (`BehaviorRules`) if a rule changed, update this file if architecture changed, then code.
- How to read the design from Claude Code: use the Artifact tool, action `read`, with the artifact URL and `path` set to `project/<BoardName>.dc.html` (for example `project/Main.dc.html`). `project/canvas.json` is the index of all boards (position, size, title, canvas page). Boards are small HTML files: read the markup and inline styles for exact text, sizes and states. Never guess a design from memory.
- At each milestone the owner may ask for a **design snapshot** copied into `docs/design-snapshot/` (read-only reference, with the artifact version number in its name). The artifact stays the source of truth.

### R2. One place for everything (no repeated code)
Write each thing once and reuse it. The concrete rules:

| Thing | Lives in (only here) |
|---|---|
| Every URL/route | `src/lib/routes.ts` (no hard-coded `href` strings anywhere else) |
| Every built-in English text (buttons, errors, banners, dialog titles) | `src/lib/strings.ts`, grouped by feature |
| Colors, radii, spacing, fonts | design tokens in `src/app/globals.css` (`@theme`), never raw hex in components |
| Buttons, inputs, dialogs, menus, toasts, banners, pills, switches, tabs, tables | `src/components/ui/` only. Features compose them; no one-off lookalikes |
| What a page type is (label, defaults, schema, editor panel, runtime view, problems, summary, export, AI field list) | the **page-type registry** `src/lib/quiz/page-types/` (one folder per type). Nothing else may `switch` on page type |
| Data shape of a quiz | one Zod schema `src/lib/quiz/schema.ts`; TypeScript types are inferred from it |
| Display conditions (evaluate, "In plain words", visible pages) | `src/lib/quiz/conditions.ts` |
| Comparing two quiz versions (added/changed/removed) | `src/lib/quiz/diff.ts` (used by the editor "N changes not published" **and** the AI check screen) |
| Quiz problems (publish blockers, field errors, AI import checks) | `src/lib/quiz/validate.ts` (one function for all three uses) |
| Plan limits (5/15/500, overrides) | `src/lib/plan/limits.ts`, used by server enforcement and by the UI |
| Dates, numbers, "Edited 2 days ago" | `src/lib/format.ts` |
| Slug rules and reserved words | `src/lib/slug.ts` (same function on client and server) |
| Environment variables | `src/lib/env.ts` (Zod-checked), nothing reads `process.env` elsewhere |
| Database access | `src/server/repos/*` only. Components and pages never import Supabase directly |
| Emails (templates and sending) | `emails/` (templates) and `src/server/email/` (sending) |

More rules:
- **Second time you write the same markup or logic, extract it.** Do not wait for a third time.
- The design has separate desktop and phone copies of website pages (for example `Home` and `HomeMobile`). In code that is **one responsive component**, never two.
- One component per file, a feature folder per area, files under about 300 lines. Prefer small pure functions with unit tests.
- No dead code, no commented-out code, no unused dependencies. Remove what the new design does not use.
- Strict TypeScript, no `any` without a comment explaining why.

### R3. Plan files are the memory
After any session that changes structure, routes, data, limits or rules: update the matching file in `plan/` (see `CLAUDE.md`). Never end such a session without doing it. This file (`project_handover.md`) holds the checklist: tick items as they are done and add anything new that was discovered.

### R4. Test like a real user before production
Nothing goes to production until `npm run release-check` is green. That includes the **QC scripts** (section 14): real browser (Playwright), real clicks, real emails (a test inbox), real file uploads, desktop and phone sizes. Testing only the backend does not count.

### R5. Security basics
- **The GitHub repo is public.** Everything pushed is readable by anyone: no keys, no `.env*`, no customer data, no private notes. CI runs a secret scanner on every push.
- Every table has Row Level Security (RLS) switched on. No exceptions.
- The Supabase **service-role (secret) key** exists only in `src/server/**` files that start with `import "server-only"`, and only in server environment variables. Never in client code, never in a `NEXT_PUBLIC_` variable, never in git.
- Never trust the client: every limit, permission, validation and plan check is repeated on the server. The UI checks are only for friendliness.
- Admin screens call the database only through server code that first checks `profiles.role = 'admin'`.

### R6. Language
All UI text is English. Built-in text (buttons like "Continue", "Start the quiz", every error and validation message) is fixed English with no setting and is **not** part of the Edit with AI data. What the owner types (titles, questions, answers, hints) can be in any language.

### R7. Work in small, checked steps
One phase at a time (section 12). Each phase ends with its **done-when** list, its tests, a plan-file update and an owner check. Do not start the next phase with a red test.

### R8. Never edit what you have not read
Read a file and its neighbours before changing it. Read the design board before building its screen.

---

## 2. What we are building

A **simple Google-Forms replacement for quizzes and surveys**, for non-technical people.

- A person registers, builds a quiz from simple pages (questions, numbers, dates, text, info, loading, one Start page, one End page), shares **one link**, and reads the answers (summary charts, individual answers, download as CSV/Excel/JSON).
- People answering need **no account**. Quizzes are **phone first**. The dashboard is **computer only** (a phone sees "The dashboard works best on a computer").
- Plans: **Free** (5 quizzes, 15 pages per quiz, 500 finished responses per quiz, pictures up to 5 MB, "Powered by Quiz" shown) and **Custom** (set per person by the admin: own domain, brand colors, hide "Powered by Quiz", bigger limits; no payment flow, people contact us).
- Extra feature: **Edit with AI** (copy the quiz as JSON plus instructions, edit it in any AI chat, paste the answer back, check, update).
- An **admin area** only for the owner: sign-ups overview, user list, plan switch, limits, suspend/delete with confirmation.
- Website: Home, Pricing, Contact, Terms, Privacy, errors, maintenance, register/login/verify/reset flows.

Out of the first version (decided): embedding in other websites, QR codes, team members, emails to the owner for each new answer, payments inside the app, different End pages per answer, file-upload questions, scores and calculated results, translations of built-in text, per-quiz SEO titles, custom domain routing (admin can store a domain name only).

Domains: the design uses placeholders (`yourshop.com`, `quiz.com`). Real domain is decided later (see section 11). Quiz links look like `https://<site>/quiz/<slug>`.

---

## 3. The design: where it is and how it maps to code

The artifact has 7 canvas pages and 158 boards. Appendix A lists every board. Meaning of the canvas pages:

| Canvas page | What it holds |
|---|---|
| Dashboard (`dash`) | everything after login: quiz list, editor, page types, conditions, publish/share, settings, responses, account, limits, errors, **Edit with AI** |
| Quiz (what people see) (`quiz`) | the phone-first quiz runtime and all its states, plus the board **How the quiz behaves** |
| Website (`web`) | home, pricing, contact, legal, errors, register/login/verify/reset flows (desktop and phone copies) |
| Shared components (`comp`) | logo, navigation, footer, call-to-action band, account button |
| Branding (`logo`) | logo, icons, link previews, **UI kit** (foundations, buttons and forms, menus and messages, navigation and data) |
| Emails (`emails`) | the five emails |
| Admin (`admin`) | admin overview, users, one person, dialogs, no-access page |

**Design tokens** (from the UI kit boards; put these in `globals.css`):
- Colors: Slate `#334155` (primary), Ink `#1E293B` (text), Muted `#5B6778`, Control border `#7B8797`, Line `#D5DBE3`, Soft `#EAEEF3`, Dashboard page `#F4F6F8`, Website page `#F7F9FB`, White `#FFFFFF`, Tint `#C9D6EA`, Accent `#7F93B2`, Danger `#B3261E` (tint `#FBEAE8`, border `#E4A9A4`, text `#7A1A14`). Secondary text on white also uses `#3F4B5C`.
- Font: Inter. Sizes: Display 60/64 weight 800; H1 36–48; H2 24–30 weight 700; H3 18–20 weight 700; Body large 18/28; Body 16/24; Small 14/20; Label 13 caps weight 700.
- Space: 4 px grid (4, 8, 12, 16, 24, 32, 48, 72, 96). Radii: 8 small, 10 buttons and inputs (dashboard), 16 cards, 24 large cards, 999 pills and website buttons.
- Touch targets at least 44 px. Focus ring: 3 px Slate outline, 2 px offset, always visible with the keyboard. Never use color alone to show a state.
- Motion: quick 200 ms (hover/press/focus), entrance 800 ms slide-up 18 px with `cubic-bezier(.2,.7,.2,1)`, ambient 14–34 s. Content is never hidden before it moves. **Everything must stop under `prefers-reduced-motion`.** Hover and motion code rules (decided 2026-11-07 after the first review): only `translate`, `opacity` and `transform` move; shadows are a layer that fades in, never an animated `box-shadow`; a lift always uses the shared `.lift` class (it keeps the pointer on the element while it moves, so it cannot flicker at the edge); every `transition-*` that moves something must list `translate` (Tailwind 4 moves with `translate`, not `transform`); link underlines fade with `textLink`; open/close panels use a `grid-template-rows` transition; anchor links scroll smoothly.
- **Quiz theme (6 colors)**: primary, text on primary, background, text, muted text, border. Default values are the Slate set above. Custom plan can change them (CSS variables set on the quiz page).

---

## 4. Architecture

### 4.1 Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript strict | already in the repo |
| Styling | Tailwind CSS v4 + CSS variable tokens | already in the repo |
| UI primitives | own components in `components/ui` (cva + tailwind-merge + Radix Slot, shadcn style) | add only the Radix pieces actually needed (Dialog, DropdownMenu, Switch, Tabs, Popover) |
| Editor state | Zustand + Immer | already in the repo; one store with an undo stack |
| Drag and drop | dnd-kit | already in the repo (page reorder) |
| Charts | Recharts | already in the repo (Summary); load only on the responses pages |
| Validation | Zod 4 | already in the repo |
| Backend | **Supabase**: Postgres, Auth, Storage | new |
| Supabase client | `@supabase/ssr` and `@supabase/supabase-js` | new |
| Email sending | **Resend** (contact + our own emails; also SMTP for Supabase Auth emails) and **React Email** templates | new, Phase 12 (a Mailtrap sandbox test inbox before that) |
| Spreadsheet export | `exceljs` (xlsx); CSV and JSON written by hand | new |
| IDs | `nanoid` | new |
| Bot protection | Cloudflare Turnstile (register, forgot password, contact) | new, Phase 14 |
| Error monitoring | Sentry | new, Phase 14 (Privacy Policy already lists "error monitoring") |
| Visitor counting | a **cookieless** tool (Vercel Web Analytics or Plausible) | decision D6 |
| Unit tests | Vitest | new |
| Browser tests (QC) | Playwright (+ `@axe-core/playwright`) | new |
| DB tests | RLS and logic tests with Vitest + `supabase-js` against the dev project, using real test accounts (no Docker). pgTAP only in CI, optional | new |
| Hosting | Vercel (app) + Supabase Cloud (data) | see section 15 |
| Source control | GitHub, **public** repo https://github.com/ememdeee/quiz (exists, `main` connected) | done |

### 4.2 Picture of the system

```
 Visitor / quiz taker (phone)                 Owner (computer)                 Admin (computer)
        |                                            |                                |
        v                                            v                                v
  /quiz/[slug]  (public)                  /dashboard, /account              /admin  (role = admin)
  QuizRunner (client)                     Editor, Responses, Settings       Overview, Users
        |                                            |                                |
        |  route handlers /api/q/*                   |  server actions               |  server actions
        v                                            v                                v
  ------------------------------  src/server  (server-only code)  -------------------------------
   repos (the only code that talks to Supabase)   email   rate-limit   guards (who may do what)
  --------------------------------------------------------------------------------------------------
        |                         |                            |
        v                         v                            v
   Postgres (RLS on)        Supabase Auth                 Storage bucket "quiz-media"
   profiles, quizzes,       email+password, Google,       pictures (public read,
   responses, media, ...    sessions, bans                 owner-only write)
```

Two ways data flows:
- **Owner side** (logged in): browser -> server action -> repo -> Supabase with the **owner's own session**, so RLS protects everything even if our code has a bug.
- **Public side** (nobody logged in): browser -> route handler -> repo using the **service role**, but only through tiny, specific functions (`getPublishedQuiz`, `startResponse`, `saveAnswer`, `finishResponse`, `trackOpen`) that validate every input against the published quiz and rate-limit by IP hash.

### 4.3 Ports and adapters (so the UI can be built first with dummy data)

Pages and components call **repositories** defined as TypeScript interfaces in `src/server/repos/ports.ts` (for example `QuizzesRepo.list(ownerId)`, `QuizzesRepo.saveDraft(...)`). Two implementations exist:

- `src/server/repos/mock/*`: in-memory data seeded from `src/data/mock/*` and saved in `localStorage`/a cookie so edits survive a refresh. Used in Phase 2.
- `src/server/repos/supabase/*`: the real thing, built in Phases 3 to 11.

A single environment variable `DATA_MODE=mock|supabase` (read in `env.ts`) selects which one is wired in `src/server/repos/index.ts`. **The UI must not change when we swap.** The mock repos must follow the same rules as the real ones (limits, slug uniqueness, validation) because they call the same shared `lib/` functions. The mock layer is deleted at the end (Phase 15) or kept only for local demos if the owner wants.

### 4.4 Folder structure (target)

```
quiz/
  CLAUDE.md  AGENTS.md  README.md
  plan/                      project_structure.md  project_handover.md (this)  project_business.md ...
  docs/                      runbooks, design-snapshot/ (optional)
  emails/                    React Email templates (source of truth for all email HTML)
  supabase/
    config.toml  migrations/  seed.sql  tests/ (pgTAP)  templates/ (generated auth-email HTML)
  qc/                        Playwright QC scripts: specs/ helpers/ fixtures/ screenshots/
  src/
    app/
      (site)/                home, pricing, contact, terms, privacy, not-found  (SiteNav + SiteFooter layout)
      (auth)/                login, register, forgot-password, reset-password, verify-email, ... (split layout)
      auth/                  callback, confirm, email-change/confirm   (route handlers)
      (app)/                 dashboard shell: dashboard/, dashboard/[quizId]/, account/
      (admin)/               admin/, admin/users, admin/users/[userId]
      quiz/[slug]/           public quiz (minimal layout, theme variables)
      api/                   q/[slug]/..., r/[id]/..., quizzes/[id]/export, slug-available, health
      error.tsx  global-error.tsx  not-found.tsx  maintenance (via middleware)
    components/
      ui/                    Button, Input, Textarea, Select, Switch, Checkbox, Radio, Segmented, Tabs, Dialog, Menu, Toast, Banner, Pill, Card, Table, Skeleton, EmptyState, Avatar, Spinner, ProgressBar
      layout/                SiteNav (+logged in), SiteFooter, CtaBand, DashHeader, AdminHeader, AccountMenu, Logo
      quiz-runtime/          QuizRunner, page views, ProgressBar, state screens (closed, resume, already done, error ...)
      editor/                PageList, Canvas, panels, ConditionsEditor, AddPageDialog, PageMenu, EditorHeader, SaveStatus ...
      responses/             SummaryView, IndividualView, ExportMenu, DeleteDialogs
      ai/                    AiHelperDialog, CheckView, StateMessages
      media/                 MediaLibraryDialog
      admin/                 OverviewStats, UsersTable, PersonForm, ConfirmDialogs
    lib/
      quiz/                  schema.ts  page-types/  conditions.ts  diff.ts  validate.ts  templates/  time-estimate.ts  ids.ts  units.ts
      ai/                    prompt.ts  export.ts  import.ts
      plan/                  limits.ts
      responses/             summarize.ts  answers.ts  export/ (csv.ts xlsx.ts json.ts)
      routes.ts  strings.ts  env.ts  format.ts  slug.ts  utils.ts
    server/                  (every file starts with import "server-only")
      supabase/              browser.ts  server.ts  admin.ts (service role)
      repos/                 ports.ts  index.ts  supabase/  mock/
      actions/               one file per feature (quizzes, media, responses, account, auth, admin, contact, ai)
      auth/                  guards.ts  lockout.ts
      email/                 send.ts
      rate-limit.ts
    store/                   editorStore.ts (zustand + immer + undo)
    hooks/
    data/mock/               dummy content for Phase 2
    types/                   database.ts (generated by Supabase CLI)
    middleware.ts            session refresh, maintenance mode, route guards, security headers
```

### 4.5 Naming and conventions
- Files: `kebab-case.ts`, components `PascalCase.tsx`. Tests next to code: `thing.test.ts`.
- Server actions return `{ ok: true, data } | { ok: false, error: { code, message } }` using one shared `ActionResult` type. Error `code`s come from one list in `src/lib/errors.ts` and map to text in `strings.ts`.
- Dates are stored in UTC and shown in the viewer's time zone by `format.ts`.
- IDs: database rows use `uuid`; page and answer ids inside a quiz use short `nanoid(10)` strings.
- Commits: small, imperative, one topic (`Add slug availability check`). Branch per phase or feature: `phase-2-ui`, `feat/slug-check`.

---

## 5. The quiz data model (`quiz-v1`)

### 5.1 Why a quiz is one JSON document
All pages of one quiz (text, answers, pictures references, display conditions, order) live in **one JSON document** stored in a single column (`quizzes.draft`, and a frozen copy in `quizzes.published`). Reasons:
- **Edit with AI works with no translation.** Export reads the document, import validates and writes it back. The same shape is used by the editor, the database, the AI chat and the tests.
- **Publish is a copy** of the draft into `published` (a snapshot), and "N changes not published" is a diff of two documents.
- Page order, duplicate, undo and drag-and-drop are plain array operations.
- Responses reference pages by their stable `id`, so editing the quiz never breaks old answers.

Rejected: one table row per page. It needs ordering columns, many writes per edit, and a mapping layer for AI import/export.

### 5.2 Shape (this Zod schema is the source of truth: `src/lib/quiz/schema.ts`)

```ts
QuizDocument = {
  format: "quiz-v1",
  name: string,                 // private quiz name (also in quizzes.name). Exported for context; IGNORED on AI import
  pages: Page[]                 // exactly one welcome first, exactly one end last, 2..limit pages
}

Page = common & (Welcome | Choice | Text | NumberPage | Info | Loading | End)
common = { id: string /* nanoid(10), 1..40 chars [A-Za-z0-9_-] */, show?: ShowRule /* not allowed on welcome and end */ }

Welcome    { type:"welcome", title(1..120), text(0..500), picture: MediaRef|null }
Choice     { type:"choice",  question(1..300), answers: {id, text(1..150), picture: MediaRef|null}[2..8],
             multiple: bool, required: bool, picture: MediaRef|null }
Text       { type:"text",    question(1..300), input:"any"|"email"|"phone", hint(0..100), required: bool }
NumberPage { type:"number",  question(1..300), kind:"age"|"height"|"weight"|"number"|"date",
             unit: string(0..20)|null, min: number|null, max: number|null, required: bool }
Info       { type:"info",    title(1..120), text(0..1000), picture: MediaRef|null }
Loading    { type:"loading", message(1..120), steps: string[1..6] (each 1..80), seconds: int 2..15 }
End        { type:"end",     style:"thanks"|"button"|"offer", title(1..120), text(0..500), picture: MediaRef|null,
             buttonText?(1..40), link?: https URL, price?(0..40), priceNote?(0..60), note?(0..120) }

ShowRule { match:"all"|"any", rules: Rule[1..10] }
Rule     { page: id of an EARLIER page, op:"is"|"is not"|"more than"|"less than", value: string|number }
MediaRef = string  // id of a row in "media" owned by the quiz owner
```

Notes and defaults:
- Drafts may be **incomplete** (empty question, fewer than 2 answers). The Zod "draft" schema is lenient; the `validate.ts` "publish" rules are strict (section 5.4). Both come from the same page-type definitions.
- `number.kind` defaults: **age** unit `years` (fixed) min 18 max 99; **height** unit `cm` (or `in`) range 120–230 (cm) / 48–90 (in); **weight** `kg` (or `lb`) 30–300 / 70–660; **number** free unit text or empty, any range; **date** no unit, min or max. Changing a unit refills the range. (`lib/quiz/units.ts` keeps these constants once.)
- `Choice.multiple = false` means pick one and move on by itself; `true` shows Continue.
- A Choice page where any answer has a picture uses the "pictures" layout (design `TypePictures`/`FEChoicePics`).
- A **new blank quiz** is created with: a `welcome` page (title = quiz name, empty text, no picture) and an `end` page (style `thanks`, title "Thank you!", text "We got your answers. You can close this page now."). Nothing else.
- Templates (`src/lib/quiz/templates/`): `contact-form`, `feedback`, `quiz-with-a-result`, with the pages listed on the design board `TemplateContents`. Each template is a valid `QuizDocument` constant. "A copy of a quiz I already have" duplicates `draft` into a new quiz.
- Page limit counts all pages including welcome and end (a quiz always has at least 2).
- Maximum document size is checked on save (1 MB).

### 5.3 Display conditions
- Rule sources can only be **choice** and **number** pages (the two kinds shown in the design). Assumption to confirm in Phase 2: text and date pages cannot be used as a condition source.
- `is` / `is not` on a choice page compare the answer id; on a multiple-choice (pick several) page `is` means "includes".
- `more than` / `less than` compare numbers.
- A page with `show` is visible only if the rules pass (`all` = every rule, `any` = at least one). A rule whose source page is itself hidden is false.
- `lib/quiz/conditions.ts` exports: `isPageVisible(page, answers)`, `visiblePages(doc, answers)`, `describeShowRule(doc, page)` (the "In plain words" sentence), `dependentsOfPage(doc, pageId)`, `dependentsOfAnswer(doc, pageId, answerId)`, `removeDependencies(...)`. The runtime, the editor, the summary and the validator all use these and nothing else.
- Deleting a page or an answer used by other pages' rules: warn, then remove those rules (a page left with no rules shows to everyone). Two or more rules show the All/Any switch; one rule hides it.
- Reordering must keep the rule "a rule looks only at an earlier page". If a drag would break it, the editor either blocks that drop or removes the broken rules with a warning (use the same dialog as deleting; confirm with the owner in Phase 5).

### 5.4 Problems (`lib/quiz/validate.ts`)
One function `validateQuiz(doc, ctx)` returns `Problem[]` where `Problem = { pageId, field?, code, message }`. It is used three times: field errors in the editor, the **Publish** gate, and **AI import**.
Blocking at publish: no title/question on a page; a choice page with fewer than 2 non-empty answers or an empty answer; a number page with min greater than max; an end page with style `button`/`offer` but no valid `https://` link or no button text; a quiz with no question page; a rule pointing to a missing/later page; wrong shape (not exactly one welcome first and one end last); more pages than the person's limit; a picture not in the owner's library.

### 5.5 Responses (what is saved)
```ts
Response {
  id, quizId, quizVersion,
  status: "in_progress" | "finished",
  answers: { [pageId]: { type, q: string /* question text when answered */, v: Value, vt?: string[] /* option texts for choice */ } },
  pagesSeen: string[],          // ordered ids of pages this person reached (for "Where people leave" and "Left at page N")
  lastPageId, startedAt, updatedAt, finishedAt
}
Value: choice -> string[] (option ids) | text -> string | number -> number | date -> "YYYY-MM-DD"
```
- An answer keeps the question text (`q`) and the chosen option texts (`vt`) **as they were when answered**. That is how a renamed or deleted question still shows in Responses and downloads (rules in `BehaviorRules`, "Changing a quiz that already has answers").
- Column logic for Individual, Summary and downloads: current published pages first (by `id`, label = current question), then **removed** page ids found in answers, labelled with the last saved `q` plus "(removed)".
- A response is **finished** when the person reaches the End page. Anything else is unfinished ("Left at page N", N = position of `lastPageId`).

### 5.6 Small shared logic (all in `lib/`, all unit tested)
- Start page time line: `max(1, ceil(questionPages * 10 / 60))` minutes, "Takes about N minutes" (`time-estimate.ts`). Question pages = choice, text, number.
- Progress bar (runtime): `reached ÷ expected`, where expected = pages this person will see given current answers; **never decreases**; hidden on first and last page; 100% on the last. Back goes to the previous page actually seen (skip hidden). Changing an answer so that a later page no longer applies deletes that page's answer when the person moves forward.
- Quiz theme: six CSS variables on the quiz root.

---

## 6. Database design (Supabase / Postgres)

Everything below becomes SQL **migrations** in `supabase/migrations/` (never edit the database by hand). The SQL here is the intended shape; refine while writing the real migration, keep the intent.

### 6.1 Types and extensions
```sql
create extension if not exists citext;
create extension if not exists pgcrypto;
create type plan_t as enum ('free', 'custom');
create type role_t as enum ('user', 'admin');
create type account_status_t as enum ('active', 'suspended');
create type response_status_t as enum ('in_progress', 'finished');
```

### 6.2 Tables

```sql
-- One row per person. id = auth.users.id. Email lives in auth.users (never copied).
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null default '' check (char_length(name) <= 100),
  role          role_t not null default 'user',
  plan          plan_t not null default 'free',
  status        account_status_t not null default 'active',
  suspended_at  timestamptz,
  max_quizzes   int check (max_quizzes   > 0),   -- null = plan default
  max_pages     int check (max_pages     > 0),
  max_responses int check (max_responses > 0),
  brand_unlocked            boolean not null default false,  -- may change the 6 quiz colors
  can_hide_powered_by       boolean not null default false,
  custom_domain text,                                         -- stored only, no routing in v1
  admin_notes   text,                                         -- admin-only
  created_at    timestamptz not null default now()
);

create table public.quizzes (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 100),
  slug          citext not null,
  draft         jsonb not null check (jsonb_typeof(draft) = 'object'),
  draft_version int   not null default 1,                -- +1 on every save (optimistic concurrency)
  published         jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_version int,                                  -- = draft_version at publish time
  published_at  timestamptz,
  accepting_responses boolean not null default true,      -- Open / Closed (separate from published)
  theme         jsonb,                                    -- 6 colors, null = defaults (needs profiles.brand_unlocked)
  hide_powered_by boolean not null default false,         -- needs profiles.can_hide_powered_by
  finished_count int not null default 0,                  -- kept by trigger on responses
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()        -- "Edited 2 days ago"
);
create unique index quizzes_slug_key on public.quizzes (slug);          -- citext => case-insensitive, GLOBAL
create index quizzes_owner_idx on public.quizzes (owner_id, updated_at desc);

create table public.responses (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references public.quizzes(id) on delete cascade,
  quiz_version  int  not null,                             -- published_version when started
  token_hash    text not null,                             -- sha256 of the secret token kept in the person's browser
  status        response_status_t not null default 'in_progress',
  answers       jsonb not null default '{}',
  pages_seen    text[] not null default '{}',
  last_page_id  text,
  started_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  finished_at   timestamptz
);
create index responses_quiz_started_idx  on public.responses (quiz_id, started_at desc);
create index responses_quiz_status_idx   on public.responses (quiz_id, status, finished_at desc);

create table public.quiz_daily_stats (                     -- "People who opened it"
  quiz_id uuid references public.quizzes(id) on delete cascade,
  day     date not null,
  opened  int  not null default 0,
  primary key (quiz_id, day)
);

create table public.media (                                 -- the "My pictures" library
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  path       text not null unique,                          -- storage path "<owner_id>/<id>.<ext>"
  file_name  text not null,
  mime       text not null check (mime in ('image/jpeg','image/png','image/webp')),
  size_bytes int  not null check (size_bytes <= 5242880),
  width int, height int,
  created_at timestamptz not null default now()
);
create index media_owner_idx on public.media (owner_id, created_at desc);

create table public.slug_holds (                            -- protects old links, see 6.9
  slug       citext primary key,
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null
);

create table public.email_changes (                         -- our own email-change flow (supports cancel/resend)
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  new_email   citext not null,
  token_hash  text not null,
  expires_at  timestamptz not null,                         -- now() + 24 hours
  created_at  timestamptz not null default now(),
  confirmed_at timestamptz, cancelled_at timestamptz
);

create table public.login_attempts (                         -- "Too many tries" lock
  id bigserial primary key,
  email citext not null, ip_hash text not null,
  success boolean not null, created_at timestamptz not null default now()
);
create index login_attempts_email_idx on public.login_attempts (email, created_at desc);

create table public.rate_limits (                            -- generic counters (contact form, slug check, public quiz calls)
  key text not null, window_start timestamptz not null, hits int not null default 1,
  primary key (key, window_start)
);

create table public.contact_messages (                       -- copy of every contact form message (email may fail)
  id uuid primary key default gen_random_uuid(),
  name text not null, email citext not null, topic text not null, message text not null,
  ip_hash text, email_sent boolean not null default false, created_at timestamptz not null default now()
);

create table public.admin_log (                              -- every suspend / restore / delete / plan change
  id bigserial primary key,
  admin_id uuid not null, action text not null, target_user_id uuid, details jsonb,
  created_at timestamptz not null default now()
);
```
(`admin_log.admin_id`/`target_user_id` are not foreign keys so the log survives deleting a person.)

### 6.3 Triggers and functions (all `security definer` ones live in a private schema or are not granted to `anon`)
- `handle_new_user` (after insert on `auth.users`): create the `profiles` row, name from `raw_user_meta_data.name` or Google `full_name`.
- `touch_updated_at` on quizzes; `bump_finished_count` on responses (insert/update of `status`/delete adjust `quizzes.finished_count`).
- `protect_profile_columns` (before update on profiles): a normal user may change **only `name`**. `role`, `plan`, `status`, limits, flags, notes, `custom_domain` change only from the service role.
- `enforce_quiz_limit` (before insert on quizzes): count the owner's quizzes against `limits(profile).quizzes`.
- `enforce_media_limit` if decision D4 adds a picture quota.
- RPC `save_draft(quiz_id, base_version, doc)`: in one statement update `draft`, `draft_version = draft_version + 1`, `updated_at` where `id` and `draft_version = base_version` and the caller owns the quiz; validates page count against the owner's limit and size ≤ 1 MB. Zero rows updated means **conflict** (someone saved from another tab): return `conflict`.
- RPC `publish_quiz(quiz_id, base_version)`: copy `draft` to `published`, set `published_version`, `published_at`. (The strict validation runs in the server action before calling it; the function re-checks page count.)
- RPC `finish_response(...)` and `start_response(...)`: atomic checks (quiz published and open, owner `active`, `finished_count < limit`) so two people cannot both take the 500th slot.
- RPC `slug_available(slug, quiz_id)` (see 6.9) and `track_open(quiz_id)` (upsert into `quiz_daily_stats`).
- RPC `rate_limit_hit(key, limit, window_seconds)` returns whether the caller is allowed.
- Admin read helpers (`admin_overview`, `admin_users_page`, ...) exist **only** in the `private` schema and are called with the service role from `src/server/admin`. They return counts and profile data, **never response content**.

### 6.4 Row Level Security (RLS) — switch on for every table
| Table | Who can do what |
|---|---|
| `profiles` | the person reads their own row; may update only `name` (guard trigger above). Nobody else. |
| `quizzes` | the owner has full read/insert/update/delete on rows where `owner_id = auth.uid()`. No public policy. (Public reads go through server code.) |
| `responses` | the quiz owner can `select` and `delete` responses of their quizzes. **No insert/update from clients at all**; only server code with the service role writes them. |
| `quiz_daily_stats` | the quiz owner can `select`. Writes only via `track_open`. |
| `media` | the owner has full access to their own rows. |
| `slug_holds`, `email_changes`, `login_attempts`, `rate_limits`, `contact_messages`, `admin_log` | **no policies** (RLS on, so only the service role can touch them). |
| Storage `quiz-media` | public read of objects; insert/update/delete only when the first folder name equals `auth.uid()`. |

Admins are not given any extra RLS access. They use server code with the service role after the `role = 'admin'` check, and only the allowed admin functions.

### 6.5 Storage
- Bucket `quiz-media`: **public read** (quiz pictures are shown to anyone with the quiz link), `file_size_limit = 5 MB`, `allowed_mime_types = image/jpeg, image/png, image/webp`.
- Path: `<owner_id>/<media_id>.<ext>`.
- Upload flow: client resizes/compresses (max 1600 px on the long side) -> server action `createUploadUrl` (checks login, type, size, quota) returns a signed upload URL -> browser uploads straight to Storage -> server action `registerMedia` verifies the object exists and records the `media` row with width and height.
- The quiz JSON stores only the `media.id`. One helper `mediaUrl(path)` builds the public URL. Pictures are served with `next/image` (add the Supabase host to `remotePatterns`).
- Deleting an account removes the whole `<owner_id>/` folder. Deleting a single picture is **not in the design** (see section 13).

### 6.6 How public people read and write (no account)
- `GET /api/q/[slug]`: returns `{ status, doc?, theme?, hidePoweredBy }`. Only the `published` snapshot is returned, never the draft. `status` and the screen it shows: `open` (the quiz), `not_published` -> `FENotPublished`, `closed` (owner turned off Accepting responses) -> `FEClosed`, `full` (response limit reached) -> `FEClosed`, `owner_suspended` -> `FEClosed`, `not_found` -> `FENotFound`. People see the same "This quiz is closed" for the three closed reasons; the owner sees the real reason in the dashboard.
- `POST /api/q/[slug]/open` (counts an "opened" once per browser tab session).
- `POST /api/q/[slug]/start` -> creates a response, returns `{ responseId, token }`. The token is random, shown only once, stored in the person's browser (`localStorage`), and only its hash is stored.
- `POST /api/r/[responseId]/answer` `{ token, pageId, value, pagesSeen }` -> validates the value against the **published** page definition with the same shared validators the client uses (type, range, required, email/phone format, option ids exist), removes answers of pages that no longer apply, saves.
- `POST /api/r/[responseId]/finish` `{ token }` -> marks finished through `finish_response` (limit check). Returns the End page.
- Resume: the browser sends `{ responseId, token }` and gets back the saved answers; wrong token = a fresh start.
- Every public endpoint is rate-limited per IP hash and per quiz, rejects oversize bodies, and never reveals other people's data.

### 6.7 Migrations, seeds, types, backups
- **No Docker** (decided 2026-11-07). Development, QC and staging use the owner's existing cloud project `quiz-dev` (ref `ubyfseqdzzuixvxmabfe`, Singapore, Free). Use the CLI through `npx supabase`: `supabase login`, `supabase link --project-ref ubyfseqdzzuixvxmabfe`, `supabase migration new <name>`, `supabase db push`, `supabase config push`, `supabase gen types typescript --linked > src/types/database.ts`. Seed data with `supabase/dev-seed.sql` (or a small Node script using the service key). `supabase db reset --linked` wipes the project: allowed **only** on the dev project. GitHub Actions has Docker, so CI may still run pgTAP there.
- `seed.sql` creates: one admin, two normal people, quizzes in every state, responses (finished/unfinished), pictures. Also a separate script `qc/helpers/seed-responses.ts` creates 450/500 responses on demand for limit tests.
- Cloud: `supabase link --project-ref <ref>` then `supabase db push` for staging and production (production only through the release process, section 15).
- Backups: Supabase Pro daily backups for production plus a weekly manual dump (`pg_dump`) stored outside Supabase; restore drill once before launch (Phase 14).
- Cleanup jobs with `pg_cron` (daily): delete `login_attempts` older than 1 day, `rate_limits` older than 1 day, expired `email_changes`, expired `slug_holds`.

### 6.8 Where each limit is enforced
| Limit | UI (friendly) | Server (hard) | Database (last line) |
|---|---|---|---|
| Quizzes per person | dialog "You've reached 5 quizzes" | `createQuiz`/`duplicateQuiz` action | `enforce_quiz_limit` trigger |
| Pages per quiz | dialog "This quiz has 15 pages"; counter "7 of 15" | `saveDraft`, `applyAiDocument`, add/duplicate page | `save_draft` RPC |
| Finished responses per quiz | banner at 450, "This quiz is full" at 500 | `start/answer/finish` handlers | `finish_response` RPC (atomic) |
| Picture size 5 MB, types | upload dialog message | `createUploadUrl` | bucket settings |
| Own brand colors / hide "Powered by" | locked "Custom plan" switches | `updateQuizSettings` checks the profile flags | none |

`lib/plan/limits.ts` exports `getLimits(profile)` = plan defaults (free: 5/15/500) overridden by the profile's non-null `max_*`. Custom plan has no built-in numbers: the admin sets them per person.

### 6.9 Slugs (safe for many people)
- Quiz link: `/quiz/<slug>`. Slug is **globally unique** (`unique index` on a `citext` column), so nobody can ever take a slug someone else uses.
- Rules (`lib/slug.ts`, used by both the form and the server): lowercase letters, numbers and single hyphens, no hyphen at the start or end, 3 to 60 characters. A short reserved list is refused (`new`, `edit`, `preview`, `admin`, `api`, `www`, `app`, `quiz`, `login`, `register`).
- **Checking while typing:** the settings field calls `GET /api/slug-available?slug=...&quizId=...` after the person pauses typing (400 ms debounce). It returns `{ available: true } | { available: false, reason: "taken" | "invalid" | "reserved" | "held" }`. Login required, rate-limited. The check is a convenience only.
- **The real guarantee** is the database unique index. `updateSlug` and `createQuiz` catch error `23505` and return "That address is already taken. Try another one." (the design `DashErrors` field error). Two people saving the same slug at the same moment: one wins, the other gets that error.
- New quiz: slug auto-made from the name (`slugify(name)`), and when taken add `-` plus 4 random letters/numbers; try up to 5 times.
- **Holds (recommendation D3):** when a quiz is deleted or its slug changed, the old slug is held for the same owner for 30 days (`slug_holds`), so a stranger cannot grab an old shared link and show something else. The owner can take it back.
- Changing a slug breaks old links by design (the Settings board warns about it).

---

## 7. Backend surface: server actions and routes

All server actions return the shared `ActionResult`. "Guard" = the check that runs first (`src/server/auth/guards.ts`): `requireUser()` (logged in, profile `active`), `requireOwner(quizId)`, `requireAdmin()`.

### 7.1 Server actions (logged-in code, `src/server/actions/*`)

| Area | Action | Guard | What it does / rules |
|---|---|---|---|
| auth | `register` | none (Turnstile, rate-limit) | Supabase `signUp` (name in metadata). Returns "check your email". Never says whether the email already exists |
| auth | `login` | none | check `login_attempts` (5 failures in 15 min => `too_many`), `signInWithPassword`, map errors: bad password => `wrong_password` (+ record failure), `email_not_confirmed` => `unverified`, `user_banned` => `suspended`. Success clears failures, redirects to `next` or the dashboard |
| auth | `logout` | user | `signOut` |
| auth | `requestPasswordReset` | none (Turnstile, rate-limit) | `resetPasswordForEmail`; always the same "check your email" answer |
| auth | `completePasswordReset` | recovery session | `updateUser({ password })`, then our "Password changed" email |
| auth | `resendVerification` | none | Supabase `resend` (60 s cooldown is enforced by Supabase and mirrored in the UI) |
| quizzes | `createQuiz({ name, from })` | user | limit check, slug generation, blank / template / copy |
| quizzes | `renameQuiz`, `duplicateQuiz`, `deleteQuiz` | owner | duplicate respects the quiz limit and gets a new slug and the name "Copy of ..."; delete also writes `slug_holds` |
| quizzes | `setAcceptingResponses(quizId, bool)` | owner | Open/Closed |
| quizzes | `saveDraft(quizId, baseVersion, doc)` | owner | validate (lenient), page limit, size, call `save_draft`; returns `{ version }` or `conflict` |
| quizzes | `publishQuiz(quizId, baseVersion)` | owner | strict `validateQuiz` first; returns the problem list or publishes |
| quizzes | `updateSlug(quizId, slug)` | owner | `lib/slug` rules, unique index, hold the old slug 30 days |
| quizzes | `updateQuizSettings(quizId, { theme, hidePoweredBy })` | owner | rejects colors if `brand_unlocked` is false, rejects hide if `can_hide_powered_by` is false |
| ai | `applyAiDocument(quizId, baseVersion, doc)` | owner | re-validate, same path as `saveDraft` |
| media | `createUploadUrl`, `registerMedia`, `listMedia` | user | see 6.5 |
| responses | `deleteResponse(id)`, `deleteAllResponses(quizId)` | owner | also lowers `finished_count` (trigger); "all" requires the typed word `DELETE` (checked in UI and server) |
| account | `updateName` | user | |
| account | `requestEmailChange(newEmail)` | user | insert `email_changes`, email the **new** address, 24 h; `cancelEmailChange`, `resendEmailChange` (60 s cooldown) |
| account | `changePassword(current, next)` | user | re-check current password, `updateUser`, sign out other devices (`signOut({ scope: "others" })`), "Password changed" email |
| account | `setPassword(next)` | user (Google-only) | `updateUser({ password })` |
| account | `disconnectGoogle` | user | only if the account has a password |
| account | `deleteAccount(typedWord)` | user | remove storage folder, `auth.admin.deleteUser` (cascades profiles, quizzes, responses, media rows) |
| contact | `sendContactMessage` | none (Turnstile, rate-limit) | validate, save `contact_messages`, send email to basurah@basrh.com with `reply-to` = visitor, set `email_sent` |
| admin | `adminOverview`, `adminListUsers`, `adminGetUser` | admin | counts and profile data only |
| admin | `adminSetPlan`, `adminSetLimits`, `adminSetFlags`, `adminSetCustomDomain`, `adminSetNotes` | admin | write `admin_log`; apply immediately |
| admin | `adminSuspend`, `adminRestore`, `adminDeleteUser` | admin | not on yourself; `ban_duration` + `profiles.status`; delete requires the typed email; always `admin_log` |
| admin | `adminExportUsersCsv` | admin | stream |

### 7.2 Route handlers
| Route | Who | Purpose |
|---|---|---|
| `GET /auth/callback` | browser | Google OAuth code exchange, then redirect |
| `GET /auth/confirm` | browser | email links (`token_hash`, `type` = signup / recovery): `verifyOtp`, sign in, redirect to dashboard (signup) or reset page (recovery); expired => the "link expired" pages |
| `GET /auth/email-change/confirm` | browser | our email-change token: set the new email (service role `auth.admin.updateUserById`, `email_confirm: true`), mark confirmed, redirect to Account with a toast |
| `GET /api/q/[slug]`, `POST /api/q/[slug]/open`, `POST /api/q/[slug]/start` | public | see 6.6 |
| `POST /api/r/[id]/answer`, `POST /api/r/[id]/finish` | public with token | see 6.6 |
| `GET /api/quizzes/[id]/export?format=csv\|xlsx\|json&from=&to=&unfinished=&q=` | owner | download, honors the filters shown on screen (section 8.8) |
| `GET /api/slug-available` | user | section 6.9 |
| `GET /api/health` | anyone | `{ ok: true }` for monitoring |

---

## 8. Feature by feature: boards, routes, logic

Format: **boards** (names in the design) -> **route and components** -> **logic**. Phase 2 builds the screens with dummy data; the "Real logic" lines are built in the later phases.

### 8.1 Website
- **Boards:** `Home`, `HomeMobile`, `WebPricing`, `WebPricingMobile`, `Contact`, `ContactMobile`, `ContactSent`, `ContactSentMobile`, `ContactError`, `ContactErrorMobile`, `Terms`, `TermsMobile`, `Privacy`, `PrivacyMobile`, `NotFound`, `NotFoundMobile`, `Error500`, `Error500Mobile`, `Maintenance`, `MaintenanceMobile`; shared `SiteLogo`, `SiteNav`, `SiteNavIn`, `SiteNavMobile`, `SiteNavMobileIn`, `SiteNavMobileOpen`, `SiteFooter`, `SiteFooterMobile`, `CtaBand`, `CtaBandMobile`.
- **Routes:** `/` `/pricing` `/contact` `/terms` `/privacy`, `not-found.tsx`, `error.tsx` + `global-error.tsx`, maintenance screen. One responsive component per page.
- **Copy** lives in `src/content/<page>.ts` (not inside components), long legal text in `src/content/legal/*.md|ts`. Terms and Privacy are templates (real company name and legal review come later, tracked in section 11).
- **Navigation** has a logged-out and a logged-in version (`SiteNav` / `SiteNavIn`; phone menu `SiteNavMobile*`): logged-in shows "My quizzes" and the avatar (`DashAccount`). Opening Log in/Register while logged in redirects to the dashboard. "Create your quiz" buttons go to `/register` (or `/dashboard` when logged in). The footer and CTA band are one component each.
- **Home** carries the motion described in the design (hero entrance, scrolling tags, growing bars). It must respect `prefers-reduced-motion`. The Home feature cards and FAQs include **Edit with AI**; Pricing lists it for Free and Custom.
- **Contact:** fields "What do you need?" (Your own domain / Your colors and logo / A custom quiz page / Something else), name, email, message. Errors exactly as `ContactError` (page-level "We couldn't send your message...", "Please enter a valid email.", "Please write a short message."). Real logic: `sendContactMessage` (Turnstile, rate limit, saved + emailed). Success shows `ContactSent`.
- **Maintenance:** environment flag `MAINTENANCE_MODE=true` makes the middleware answer every page with the Maintenance page (HTTP 503) except `/api/health`.
- **SEO and previews:** marketing pages are indexable with a title/description each; `/dashboard`, `/account`, `/admin`, `/quiz/*`, and auth pages are `noindex` (decision D5). `robots.ts` and `sitemap.ts`. Link previews: `SocialHome` for the website, `SocialQuiz` pattern for quiz links (generated with `next/og`, using the quiz Start page title; one fallback image). Favicons and app icons from `BrandIcons` (`app/icon`, `apple-icon`, manifest). Logo from `LogoA`.
- The old site is `noindex` and `Disallow: /`; remove that for marketing pages only when the owner says the site goes public (a release checklist item).

### 8.2 Register, log in, verify, reset
- **Boards:** `Register`, `Login`, `LoginError`, `LoginUnverified`, `LoginTooMany`, `LoginSuspended`, `LoginGoogleExists`, `LoginGoogleCancelled`, `ForgotPassword`, `ForgotSent`, `ResetPassword`, `ResetDone`, `ResetExpired`, `VerifySent`, `VerifyResent`, `VerifyDone`, `VerifyExpired`, `AccountDeleted`, and every `...Mobile` copy.
- **Routes:** `/register` `/login` `/forgot-password` `/forgot-password/sent` `/reset-password` `/reset-password/done` `/reset-password/expired` `/verify-email` (sent / resent state) `/verify-email/done` `/verify-email/expired` `/goodbye`. One shared split layout (form left, animated panel right; the panel hides under 900 px).
- **State map (what triggers each screen):**

| Screen | Trigger |
|---|---|
| `LoginError` | wrong email/password (message does not say which) |
| `LoginUnverified` | correct password but email not confirmed; "Send it again" |
| `LoginTooMany` | 5 failures in 15 minutes for that email; button disabled; also offers reset password |
| `LoginSuspended` | `user_banned` / `profiles.status = suspended` |
| `LoginGoogleCancelled` | OAuth callback with `error=access_denied` |
| `LoginGoogleExists` | see decision D2 (Supabase links identities with the same verified email by itself) |
| `VerifySent` / `VerifyResent` | after register / after "Send the email again" (button disabled for 60 s, shown as "(60s)") |
| `VerifyDone` | `/auth/confirm` success for signup, then "Go to my quizzes" |
| `VerifyExpired`, `ResetExpired` | `otp_expired` / invalid token on those links; button sends a new link |
| `ResetDone` | password updated |
| `AccountDeleted` | after `deleteAccount` |

- **Rules:** email must be verified before the first login; the verification link signs the person in and opens the dashboard (`verifyOtp` with `token_hash`, server-side). Google sign-in needs no verification. Password: at least 8 characters. Changing a password signs out other devices and sends the confirmation email. A suspended person who is already logged in sees the "Your account is suspended" dialog on the next click (checked in the `(app)` layout on every request).
- **Open mismatches with Supabase** are in section 11 (D1 link lifetimes, D2 Google linking). Resolve them in the design **before** coding Phase 4.

### 8.3 Dashboard shell and quiz list
- **Boards:** `Quizzes`, `QuizMenu`, `Empty`, `LimitStates`, `DashPhone`, `DashAccount`, `AccountMenu`, `AccountMenuAdmin`, `Saving`, `States`, `DashErrors`.
- **Route:** `/dashboard`. Layout `(app)`: header with logo, "My quizzes", account button; opened on a phone shows `DashPhone` ("The dashboard works best on a computer").
- **List:** "3 of 5 quizzes · Free plan", **New quiz**, search, sort (Last edited / Name A to Z / Most responses), cards with status (Open / Closed / Not published; and "Full" when the response limit is reached) and "Edited 2 days ago". Card buttons: Edit, Responses (N finished), Copy link (only after first publish), Publish (for never-published). Card menu (`QuizMenu`): Edit, Responses, Copy link, Rename, Duplicate, Close/Open the quiz, Delete (confirm by typing the quiz name, `States`). Empty and no-search-result states from `Empty`.
- **Real logic:** `QuizzesRepo.list(ownerId)` returns rows with `finished_count`; search is by name; sort in SQL.
- **Account menu:** Account settings, Plans and pricing, Help and contact, Log out. Admins also see "Admin" (`AccountMenuAdmin`).
- **Shared UI states:** Saving/loading skeletons (`Saving`), toasts and confirmations (`States`), all errors (`DashErrors`: field error, couldn't load, logged out, delete page that others depend on, remove answer others depend on, quiz not found, suspended while logged in, offline).
- **Limit dialogs** (`LimitStates`): new quiz and duplicate at 5; add/duplicate page at 15; usage meters; response banners at 450 and 500.

### 8.4 New quiz and templates
- **Boards:** `NewQuiz`, `TemplateContents`.
- **UI:** a dialog: quiz name (required), "Start from" blank / template (Contact form, Feedback, Quiz with a result) / a copy of one of my quizzes.
- **Logic:** `createQuiz`. Blank = welcome + end pages (section 5.2). Templates are constants in `lib/quiz/templates/`. The new quiz opens in the editor; the slug is auto-made.

### 8.5 The editor
- **Boards:** `Main`, `MainEmpty`, `EditorStates`, `AddPage`, `PageMenu`, `Conditions`, `AddPicture`, `Publish`, `PublishProblems`, `Share`, `ShareQuiz`, `Settings`, and the page-type boards `TypeWelcome`, `TypeText`, `TypeNumber`, `TypeNumberKinds`, `TypePictures`, `TypeInfo`, `TypeLoading`, `TypeEndThanks`, `TypeEndButton`, `TypeResult`.
- **Routes:** `/dashboard/[quizId]` (Edit), `/dashboard/[quizId]/responses` (see 8.8), `/dashboard/[quizId]/settings`, `/dashboard/[quizId]/preview` (opens in a new tab). Dashboard URLs use the quiz **id**, not the slug.
- **Layout:** header (All quizzes, name, status pill "Open / Closed / Not published", save status, Edit | Responses tabs, Undo, Quiz settings, Share, Try it, Publish changes, account), left **page list** ("7 of 15 · in this order"; Start and End show a lock; drag to reorder; "Add a page"; "Edit with AI"), center **"What people see on page N"** (the real runtime page view in a 340 px phone frame), right **"Edit page N"** panel (fields of that page type from the registry).
- **State and saving (`store/editorStore.ts`):** the document lives in a Zustand+Immer store with an **undo stack** (each user action = one history entry; Edit with AI = one entry; typing is grouped by field with a short delay). **Autosave** sends `saveDraft(quizId, baseVersion, doc)` about 800 ms after the last change; status text from the `Saving` board: "Saving...", "All changes saved", "Couldn't save" + Try again; offline shows the offline bar and saves when back online. A `conflict` result (another tab saved) needs a small dialog **that is not designed yet** (section 13, G1).
- **Header states** (`EditorStates`): never published (Share dimmed, button "Publish"), published with changes ("Saved · N changes not published", "Publish changes"), published and up to date ("Everything is published", button dimmed). N = `diffQuiz(draft, published)` counts (added + changed + removed pages).
- **Add a page** (`AddPage`): Multiple choice, Text answer, Number or date, Info page, Loading screen. Start and End are never offered. New pages go just before the End page. Page limit dialog at the limit.
- **Page menu** (`PageMenu`): Duplicate page, Move up, Move down, Delete page. Start/End show a lock and have no menu. "Move down" is off for the last question. Delete asks first when other pages depend on it (`DashErrors`), then offers **Undo** in the toast (`States`, 8 s).
- **Page types:** each panel is rendered from the registry. Field lists: see `AiFormat` (the same list the AI sees) and the type boards. Number or date: chips Age / Height / Weight / Any number / A date; unit and range rules in section 5.2 (`TypeNumberKinds`). Text: any / email / phone + hint. Choice: answers 2–8 with add/remove, "Let people pick more than one", "Add pictures to the answers", question picture. End: style chips Message only / Message + button / Result + offer with their fields (`TypeEndThanks`, `TypeEndButton`, `TypeResult`).
- **Conditions panel** (`Conditions`): off by default; when on: "Show this page when [All|Any] of these are true", rule rows (earlier question, comparison, value), "Add another condition", remove, and the "In plain words" sentence (`describeShowRule`). One rule hides the All/Any switch.
- **Pictures:** every "Add a picture" opens the media dialog (8.6).
- **Problems:** `validateQuiz` drives red outlines, "Fix this" badges, field errors (shown after leaving the field, all at Publish) and the **Publish** dialog (`PublishProblems`: list with "Go to page", or "Add a question first").
- **Publish** (`Publish`): confirm dialog "Publish your changes?" with "You changed N pages since the last time you published". After the first publish the **Share** dialog opens (`Share`: link and Copy link, Open the quiz). `ShareQuiz` is the same dialog opened any time from the header, the card or the card menu.
- **Quiz settings** (`Settings`): quiz name (private), web address `/quiz/<slug>` with live availability check and the "links will stop working" warning, **Accepting responses** switch, **Colors and look** (6 colors; locked "Custom plan" unless `brand_unlocked`), **Hide "Powered by Quiz"** (locked unless `can_hide_powered_by`), Delete quiz. Autosaves with the "All changes saved" line.
- **Preview ("Try it"):** opens a new tab running the same `QuizRunner` on the **draft** with `mode="preview"`: top bar "Preview · your answers aren't saved" + Close preview; **never writes a response**.

### 8.6 Media library ("Add a picture")
- **Board:** `AddPicture` (tabs Upload / My pictures; drop zone "Drop a picture here or Choose a file"; "JPG, PNG or WebP. Up to 5 MB."; error "That file is too big. Pick one under 5 MB."; grid with "Use this picture").
- **Component:** `components/media/MediaLibraryDialog`, used by every page type that has a picture.
- **Logic:** upload flow in 6.5; the dialog lists `media` newest first; choosing a picture puts its **media id** into the page. Pictures in use stay valid until the account is deleted (no delete in v1). Real logic must be proven with an actual upload in QC.

### 8.7 The quiz people see (runtime)
- **Boards:** `FEShell` (theme colors and building blocks), `FEStart`, `FEChoice`, `FEChoiceError`, `FEChoicePics`, `FEText`, `FETextError`, `FENumber`, `FENumberError`, `FEDate`, `FEDateError`, `FEInfo`, `FELoading`, `FEEndThanks`, `FEEndButton`, `FEEndOffer`, `FEResume`, `FEAlreadyDone`, `FESaveError`, `FEClosed`, `FENotPublished`, `FENotFound`, `FEError`, `FEPreview`, `FEDesktopStart`, `FEDesktop`, and the rules board `BehaviorRules`.
- **Route:** `/quiz/[slug]` (server component fetches the published snapshot; a client `QuizRunner` takes over). Minimal layout, no site navigation, theme CSS variables on the root.
- **One runtime, three uses:** the public page, the editor "What people see" canvas, and Try it preview all render the same `QuizRunner`/page views. Page views are **registry components** (`page-types/<type>/view.tsx`). The editor passes `mode="canvas"` (non-interactive, shows the selected page), preview passes `mode="preview"` (no saving), the public page `mode="live"`.
- **State machine** (`hooks/useQuizRunner`, a reducer with unit tests): current page, answers, history of pages seen, progress, status. Every rule of `BehaviorRules` is implemented here: progress only forward; Back skips hidden pages; hidden-page answers removed on moving forward; single choice auto-advances; Continue always active with a message when a required answer is missing; number/date range checks; email/phone format; "We couldn't save your answer" + Try again keeps the person on the page.
- **Persistence adapter:** `live` mode talks to `/api/q/*` and `/api/r/*`; `preview` mode uses a no-op adapter; Phase 2 uses a fake adapter.
- **Resume / repeat:** `localStorage` key per quiz holds `{ responseId, token }`. Open a quiz with an unfinished response -> `FEResume` "Welcome back" (Continue restores answers and progress; Start over creates a new response and leaves the old one as unfinished). Finished on this device -> `FEAlreadyDone` with "Take it again". Different device -> fresh start.
- **Status screens:** `not_published` -> `FENotPublished`; `closed`, `full`, owner suspended -> `FEClosed`; unknown slug -> `FENotFound`; anything unexpected -> `FEError` with Try again. A quiz that closes mid-way shows `FEClosed` on the next save, answers stay as unfinished.
- **Start page lines** (no fields): "Start the quiz", "Takes about N minutes", "Your answers are shared with the quiz owner" + Privacy link, and "Powered by Quiz" when the owner has not hidden it (Start and End pages only). The first and last pages hide the top bar.
- **End page styles:** thanks, message + button (opens the owner's link, new tab, `rel="noopener noreferrer"`), result + offer (price, optional small texts, button to the owner's link). Only owner-filled fields appear.
- **Desktop:** the quiz is phone-first; on a computer it is a centered column (`FEDesktopStart`, `FEDesktop`), same component.
- **Performance:** the public quiz page ships no editor, chart, drag-and-drop or admin code (check the bundle in QC).
- **Counting:** `trackOpen` once per tab session; "started" = response created when the person presses Start; "finished" = reached End.

### 8.8 Responses (Summary, Individual, export, delete)
- **Boards:** `Report` (Summary, one long scrolling page), `Responses` (Individual), `ResponsesDelete`, `Empty` (no responses yet / search empty), `LimitStates` (banners).
- **Routes:** `/dashboard/[quizId]/responses` (Summary, default) and `/dashboard/[quizId]/responses?view=individual`; the header tabs Edit | Responses, and Summary | Individual switch.
- **Header actions:** date range select (Last 7 / 30 days, All time), **Export all** menu (CSV most popular, Excel .xlsx, JSON; the note "One row per person, one column per question. Includes the N responses in this list. Questions you removed keep their column at the end"), and a "..." menu with "Delete all responses...".
- **Summary content** (all computed server-side by `lib/responses/summarize.ts`, pure functions, unit tested, then rendered with Recharts or plain bars):
  - Funnel: People who opened it (sum of `quiz_daily_stats`), People who started, People who finished, Finish rate = finished ÷ started.
  - **Where people leave:** per page, share of people who reached it among those it applied to (use `pagesSeen` and `isPageVisible` on the saved answers), and the sentence "The biggest drop is between X and Y."
  - **What people answered:** a selector of choice questions with option shares.
  - **Every question** card by type (from the registry): choice (bars with the value written next to each bar), number (average, lowest–highest, answered count, small histogram; age uses brackets 18–29, 30–39, 40–49, 50–59, 60+), date (earliest, latest, answered, by month), text (how many wrote something, skipped, last 3 answers, "See all N answers").
  - Removed questions appear at the end in a "Removed questions" group.
- **Individual:** left list with search ("Search answers"), date select, "Include unfinished" checkbox, rows "Response N · date" with the pill "Left at page N", pagination "Showing 5 of 24" (page size 25 in code); right detail with every answer in page order ("No answer" for skipped, "Removed question" label for removed pages), previous/next person, **Delete**. Search filters on the answer text (server side `ILIKE` over the answers). Times show in the viewer's time zone.
- **Export (`GET /api/quizzes/[id]/export`):** respects the same filters as the screen. CSV: UTF-8 with BOM, one row per response; fixed columns Response, Status, Started, Finished, then one column per current page in order labelled like "2. What is your main goal?", multiple choice joined with "; ", then "(removed) ..." columns. **CSV formula protection:** a cell starting with `=`, `+`, `-`, `@` gets a leading `'`. Excel via `exceljs`. JSON: array of `{ id, status, startedAt, finishedAt, answers: [{ pageId, question, answer }] }`. File names: `<quiz-name>-responses-YYYY-MM-DD.<ext>`. Large exports stream. **Downloads are never limited by plan.**
- **Delete:** `ResponsesDelete` dialogs (one response: "Delete Response N?"; all: type DELETE, offers "Download your responses first"). No undo. Frees the Free limit.
- **Privacy rule:** only the quiz owner reads responses. The admin never can.

### 8.9 Account
- **Boards:** `Account`, `AccountGoogleOnly`, `AccountEmail`, `AccountPassword`, `AccountDelete`, `AccountMenu`.
- **Route:** `/account` (details, how you log in, delete). Dialogs for password and delete.
- **Details:** name (autosave "All changes saved"); email with a "Verified" pill; changing it creates a pending change shown by `AccountEmail` ("Waiting for verification ... Send it again · Cancel the change"); the old email keeps working until the new one is confirmed.
- **How you log in:** password row ("Change password", opens `AccountPassword`: current, new, confirm; wrong current shows "That isn't your current password."); Google row ("Connect" / "Connected"). `AccountGoogleOnly`: no password => "Set a password"; Google can be disconnected only after a password exists (Disconnect itself is not designed, G6).
- **Delete account** (`AccountDelete`): "Download your responses first" link, type DELETE; deletes everything; then `/goodbye`.

### 8.10 Admin (owner only)
- **Boards:** `AdminOverview`, `AdminUsers`, `AdminUser`, `AdminDialogs`, `AdminNoAccess`, `AccountMenuAdmin`.
- **Routes:** `/admin` (Overview), `/admin/users` (list), `/admin/users/[userId]`. Own layout (header with "Admin" pill, tabs Overview | Users, "My quizzes" link). Anyone else (including logged out) sees `AdminNoAccess` ("You don't have access to this page"); the page must give no hint about its content. Set `noindex`.
- **Overview:** people signed up, new this week, new this month, on the Custom plan, quizzes made, responses collected (finished); a 30-day sign-up bar chart; counters "Haven't verified their email" (from `auth.users.email_confirmed_at`) and "Close to a Free plan limit" (at least 80% of any limit, see D13; its link target is gap G7); newest people.
- **Users:** search by name or email, filters Everyone / Free / Custom / Not verified, sort (Newest first), table (Person, Plan, Quizzes, Responses, Signed up, Email verified, Open), pagination "Showing 1-8 of N", **Download as CSV**.
- **One person:** details (email verified, signed up date, "Signs in with Google"), **Plan** Free / Custom, switches Brand colors unlocked and Hide "Powered by Quiz", Custom domain (stored only), the three limits (blank = plan default; show "Free: 5" as a hint), **Save plan** ("Saved. Maria's limits apply now."), their quizzes (name, status, responses count, last edited; no response content), private notes, and the **Careful** section.
- **Dialogs** (`AdminDialogs`): Suspend (explains what happens), Restore banner on a suspended person's page, Delete (type their email, shows counts), own account disabled ("This is your own account"). Every action is written to `admin_log`.
- **Suspend implementation:** `auth.admin.updateUserById(id, { ban_duration })` + `profiles.status = 'suspended'`. Quizzes are **not changed**: the public read treats a quiz as closed while its owner is suspended, so restoring reopens exactly what was open.
- **Marking the owner as admin:** in SQL once: `update profiles set role = 'admin' where id = '<owner uuid>'`.

### 8.11 Edit with AI
- **Boards:** `AiHelper`, `AiHelperCheck`, `AiHelperStates`, `AiFormat` (the exact prompt, data sample, field table, checks).
- **Component:** `components/ai/AiHelperDialog` (three steps) and `CheckView`; logic in `lib/ai/`.
- **Export:** `buildAiExport(quiz, limits)` returns the clipboard text for "Copy for AI" (the prompt template with `{PAGE_LIMIT}` and `{QUIZ_DATA}` filled in, then an empty "My request" line) and for "Copy the quiz data only" (the JSON). The **prompt text lives in `lib/ai/prompt.ts`, and its field list is generated from the page-type registry**, so the spec the AI sees can never drift from the schema that validates the answer. The dialog remembers `copiedAtVersion` (the `draft_version` at copy time) and the time.
- **Import (`lib/ai/import.ts`, pure and unit tested):** (1) find the first complete JSON object in the pasted text, ignoring words around it and code fences (`no_quiz` if none, `cut_off` if braces never close); (2) parse and run the Zod schema, then `validateQuiz` (publish-level checks); (3) turn `new-*` ids into real ids and fix references in rules; (4) check the page limit; (5) pictures not in the owner's library are dropped and listed as "left out"; (6) `diffQuiz(current, incoming)` gives added / changed / removed / unchanged with plain descriptions ("New answer: Sleep better", "The text is different"); (7) `name` in the data is ignored; (8) same id with a different `type` counts as one removed page plus one added page.
- **Check screen** (`AiHelperCheck`): counts, the list, "N of 15 pages after the update", a note that it stays a draft until Publish, "Back" / "Update my quiz". If the quiz changed after copying (`draft_version` differs) show the "You changed your quiz after you copied it" choice first (`AiHelperStates`). No-changes state: see G2.
- **Messages** (`AiHelperStates`): copy states, no quiz, cut off, problems list with "Copy these for the AI" (builds the "Please fix these problems..." message from the `Problem[]`), too many pages, edited after copying, picture left out, success toast with Undo, checking.
- **Apply:** `applyAiDocument` (re-validates on the server), then the store pushes **one** undo entry; the dialog closes and the toast "Quiz updated · 3 pages added, 2 changed, 1 removed" with Undo appears. It never touches the published version, responses, settings or the slug.
- **Round trip rule (a QC test):** exporting a quiz and importing the same text unchanged must report "no changes".
- **After the database is final (Phase 9):** regenerate the prompt and the field table from the real schema, compare with `AiFormat`; if anything differs, **update the design board first**, then the code.

### 8.12 Emails (plain-language explanation)
"Email" here means **the system sends a message by itself when something happens** (someone registers, forgets a password, ...). A computer cannot just "send an email": it needs (1) an **email sending service** (we use Resend), (2) a **domain you own** with a few DNS records so inboxes trust the sender and do not put the mail in spam, and (3) the **templates** (the five designed emails). Until step (2) exists, emails can only be tested locally.

| Email (board) | Sent when | Sent by |
|---|---|---|
| Verify your email (`EmailVerify`) | register / resend | Supabase Auth, through our SMTP (Resend) with our HTML template |
| Reset your password (`EmailReset`) | forgot password | Supabase Auth, same way |
| Confirm your new email (`EmailNewAddress`) | email change requested | our server (Resend API), to the **new** address |
| Password changed (`EmailPasswordChanged`) | password changed or reset completed | our server (Resend API) |
| New contact message (`EmailContact`) | contact form | our server (Resend API) to basurah@basrh.com, reply-to = visitor |

- Templates are written once with React Email in `emails/` and exported as static HTML for the Supabase Auth templates (`supabase/templates/*.html`, pushed with `supabase config push`), and rendered directly for the others.
- **Development and QC:** no Docker. Supabase Auth emails and our own emails go over SMTP to a **Mailtrap sandbox** inbox (free) in the dev project; QC reads them through Mailtrap's API. Most QC specs skip email by creating verified people with the Auth admin API and `generateLink`; QC-02, QC-03, QC-14 and QC-17 use the real mail path. `email/send.ts` has two transports chosen by env: SMTP (dev/QC) and the Resend API (production). Supabase's built-in email sender is limited and only reaches team members, so set the SMTP early.
- **Production:** verify the sending domain in Resend (SPF, DKIM, DMARC), put the Resend SMTP details in Supabase Auth settings, set sender "Quiz <hello@yourdomain>", test deliverability with a mail-tester service. Needs the real domain (D9).
- Link lifetimes: see D1.

---

## 9. The existing code: what to delete, reuse, replace

The repo is a copy of an older app (a health-plan quiz with JSON files on disk, no database, GTM/Pixel tracking, 3D landing, course area). The new product replaces almost all of it. **Do not read old code to learn the new product; the design is the product.** Old code is useful only as a source of small ideas.

**Delete (Phase 1, after the owner confirms the list):**
- `src/steps/**` (all 17 old step types), `src/components/home/**`, `src/components/landing/**`, `src/components/quiz/**` (old runtime), `src/components/SettingsHydrator.tsx`
- `src/app/members/**`, `src/app/unauthorized/**`, old `src/app/editor/**`, old `src/app/login/**`, old `src/app/dashboard/**`, old `src/app/api/**`, old `src/app/quiz/**`, old `src/app/page.tsx`, `src/app/robots.ts` (rewritten)
- `src/hooks/useQuizFlow.ts`, `useQuizUrl.ts`, `useInView.ts` (re-add only if needed)
- `src/store/answerStore.ts`, `userProfileStore.ts`, `authStore.ts`, `courseStore.ts`, `redirectionsStore.ts`, `settingsStore.ts`, `quizBuilderStore.ts` (a new `editorStore.ts` replaces it)
- `src/lib/gtm.ts`, `tracking.ts`, `healthCalculations.ts`, `courseSchemas.ts`, `projectSettings.ts`, `quizData.server.ts`, `lazyWarm.tsx`, `units.ts`, `metadata.ts` (rewritten), `visibility.ts`, `branching.ts`, `conditionHelpers.ts` (replaced by `lib/quiz/conditions.ts`)
- `src/types/quiz.ts`, `stepSchema.ts`, `src/middleware.ts` (redirections), `src/contexts/ToastContext.tsx` (replaced by the UI-kit toast)
- `public/data/**` (JSON quizzes, redirections), `public/images/**`, `public/mascot/**`, all old photos and icons (keep nothing unless a design board uses it)
- Everything tracking: GTM, Meta Pixel, GA4, redirections, "short links".
- Dependencies: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `react-markdown`.

**Keep:** Next/React/TypeScript/Tailwind setup, `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `components.json` (update to the slate tokens), `.claude/launch.json` and `settings.json`, `.gitignore` (already ignores `.env*`), and the dependencies listed in 4.1 as "already in the repo".

**Fix on day one:** `next.config.ts` currently has `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` and sends a global `X-Robots-Tag: noindex` header. Remove both build-error ignores (type errors and lint errors must fail the build) and replace the robots header with the per-route rules in 8.1.

**Root files to review with the owner (do not delete without asking):** `AGENTS.md` (a mirror of `CLAUDE.md` for another tool; keep in sync or remove), `README.md` (rewrite for the new product), `dev.txt`, `ignore_dev.md`, `prd.md`, `prd-result.md`, `style_1.txt` (old notes).

**Plan files:** `project_structure.md` (rewrite for the new architecture at the end of Phase 1 and keep updating), `project_tracking.md` (old GTM/Pixel, delete when tracking is removed), `project_business.md` (old health-plan business; rewrite for the new product), `marketing_*.md` (old ad material; owner decides).

**New dependencies (add in the phase that needs them, not all at once):** `@supabase/supabase-js`, `@supabase/ssr`, `nanoid`, `exceljs`, `resend`, `@react-email/components`, `@sentry/nextjs`, Radix primitives actually used, dev: `vitest`, `@vitest/coverage-v8`, `@playwright/test`, `@axe-core/playwright`, `supabase` (CLI), `prettier`, `husky` + `lint-staged` (optional).

---

## 10. What the owner must provide (checklist)

**Never paste secrets into the chat and never commit them.** Put them in `.env.local` (local) and in the Vercel dashboard (deploys). `.env.example` (committed) lists only the variable names.

| # | What | When | How / notes |
|---|---|---|---|
| 1 | **GitHub** repo https://github.com/ememdeee/quiz (public, exists) | Phase 0 (done) | **Public means everyone can read everything pushed.** Never commit keys, `.env*`, customer data or private notes. The `plan/` files are public too |
| 2 | ~~Docker Desktop~~ **not needed** | — | Decided 2026-11-07. Development and QC use the cloud dev project |
| 3 | **Supabase** project `quiz-dev` (exists: ref `ubyfseqdzzuixvxmabfe`, Singapore, Free). One project is enough for now. The production project is created in Phase 16 | Phase 0 (done), Phase 3 (use) | Save the database password in a password manager. Step-by-step setup: `docs/handover-supabase-setup.md` |
| 4 | Supabase values -> `.env.local` | Phase 3 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (also called publishable key), `SUPABASE_SERVICE_ROLE_KEY` (secret key; **server only**), `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`. Found in Project Settings > API and > Database. Optional `SUPABASE_ACCESS_TOKEN` (personal token) so the CLI can run `link` and `db push` |
| 5 | **Google Cloud** project, OAuth consent screen, OAuth **Web client** | Phase 4 | Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback` and the local one Code lists. Give the **Client ID and Secret** to Supabase Auth > Providers > Google (dashboard) and to `.env.local` for local runs. **DONE 2026-11-07 (dev):** OAuth client `quiz-dev` (project `quiz-514006`, Testing mode, test user = owner, basic scopes only); `GOOGLE_CLIENT_ID/SECRET` in `.env.local`; provider enabled via `supabase/config.toml` + `config push`; authorize URL reaches Google with the right redirect URI. Real sign-in test is left for Phase 4. Production client and "In production" status: Phase 16 |
| 6 | **Vercel** account, repo connected, staging deploy | end of Phase 2 | Vercel Hobby is for non-commercial use; production needs a paid plan (D7) |
| 7 | The **real domain** (decision D9) and access to its DNS (Cloudflare recommended) | Phase 12 and 16 | **Domain = `quiz.basrh.com` (subdomain of the owner's `basrh.com`, D9).** Register this exact name (not `basrh.com`) in Vercel, Resend and the Google production client. Needed to send email from the domain, for production URLs and for Google/Supabase redirect settings. Until then staging uses the `*.vercel.app` URL |
| 8 | **Resend** account + API key; add the DNS records Code lists | Phase 12 | `RESEND_API_KEY`; sender `Quiz <hello@yourdomain>` |
| 9 | **Cloudflare Turnstile** site key + secret (free) | Phase 14 | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| 10 | **Sentry** project DSN | Phase 14 | `SENTRY_DSN` |
| 11 | Visitor-counting tool account if not Vercel Analytics (D6) | Phase 13 | |
| 12 | **Legal:** company or trade name, address and contact for Terms and Privacy; a lawyer review before launch | before Phase 16 | The current texts are templates |
| 13 | **Production Supabase** project `quiz-prod` on a paid plan (backups) | Phase 16 | Free projects pause after about a week of inactivity and have no backups. Staging may be free, production must not |
| 14 | Promote the owner account to admin | Phase 11 and 16 | Register normally, then run the one SQL line in 8.10 (Code gives it; owner runs it in the Supabase SQL editor, or Code runs it with the service key) |

**Mailtrap (done 2026-11-07):** owner created the account and the `quiz-dev` sandbox, and put `MAILTRAP_SMTP_*`, `MAILTRAP_API_TOKEN` (sandbox admin), `MAILTRAP_ACCOUNT_ID`, `MAILTRAP_INBOX_ID` in `.env.local`.

Code can do everything else itself: migrations, RLS, storage bucket, Auth settings (`supabase config push`), email templates, env validation, CI.

Environment variables (all validated in `src/lib/env.ts`; the app refuses to start if a required one is missing):

| Variable | Where | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | all | no |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | all | no (public by design, protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | **yes** |
| `DATA_MODE` (`mock` or `supabase`) | all (removed after Phase 15 if unused) | no |
| `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_TO` (= basurah@basrh.com) | server | key is secret |
| `TURNSTILE_SECRET_KEY` (+ public site key) | server | secret |
| `SENTRY_DSN` | all | low |
| `MAINTENANCE_MODE` | server | no |
| `IP_HASH_SALT` | server | **yes** (random string, used to hash IPs for rate limits) |

---

## 11. Decisions (log) and open questions

**Decided (do not reopen without the owner):**
- UI first with dummy data, then backend. Supabase for database, login and pictures. Vercel for hosting. GitHub repo https://github.com/ememdeee/quiz (public).
- **No Docker.** One Supabase project (`quiz-dev`, Singapore) for development, QC and staging; the production project is created in Phase 16 on a paid plan. Dev/QC emails go through a Mailtrap sandbox (D20).
- Quiz stored as one JSON document (`quiz-v1`); Edit with AI imports/exports exactly that.
- Exactly one Start page (first) and one End page (last). Free limits 5 / 15 / 500 finished responses. English UI; built-in text not editable and not in AI data.
- No cookie banner, cookieless analytics. Placeholder domain and template legal texts for now.
- Not in v1: embeds, QR codes, team members, per-answer emails, payments, per-answer End pages, file uploads, scores, translations of built-in text, per-quiz SEO, custom-domain routing.

**Open (each has a recommendation; the owner confirms by the phase shown. "Design change" means do it in Claude Design first):**

| ID | Question | Recommendation | By | Design change? |
|---|---|---|---|---|
| D1 | Supabase has **one** lifetime for all auth email links (max 24 h). The design says verify 24 h, reset 1 h | **APPROVED by owner 2026-11-07.** Use **1 hour for both**; the "expired" screens and "send again" already exist. Our own email-change link stays 24 h | Phase 4 | Yes (text on `VerifySent`, `VerifyExpired`, `EmailVerify`) |
| D2 | Supabase **automatically links** a Google login to an existing password account with the same verified email. The design shows `LoginGoogleExists` ("log in with your password") | **APPROVED by owner 2026-11-07.** Accept automatic linking (both emails are verified, so it is safe) and drop `LoginGoogleExists` | Phase 4 | Yes (remove 2 boards, update `BehaviorRules`) |
| D3 | Hold an old/deleted slug for its owner for 30 days | Yes | Phase 5 | No |
| D4 | Total pictures per person | No quota in v1 (5 MB each). Watch storage in the admin later | Phase 6 | No |
| D5 | Search engines and quiz pages | Marketing pages indexable; dashboard, admin, auth and quiz pages `noindex` | Phase 13 | No |
| D6 | Visitor counting tool | Vercel Web Analytics (cookieless, simplest). Per-quiz numbers are our own counters | Phase 13 | No |
| D7 | Vercel plan | Pro for production (Hobby is non-commercial; check current terms) | Phase 16 | No |
| D8 | Region of Supabase and of the Vercel functions (must match) | **Decided: Singapore (ap-southeast-1)**; set the Vercel functions region to Singapore (`sin1`) | done | No |
| D9 | Real domain name (site, email sender, OAuth) | Buy it now; everything in production needs it | Phase 12 | **Decided 2026-11-07: no new domain. Use the subdomain `quiz.basrh.com` (owner already owns `basrh.com`; no budget for a new one).** Needs DNS access to `basrh.com` (to add records for Vercel and Resend) |
| D10 | Custom domains for Custom-plan people | After launch. v1 stores the name only | after Phase 16 | Later |
| D11 | Rate limits | login 5 failures / 15 min per email; register 5 / hour per IP; forgot password 3 / hour per email; contact 3 / hour per IP; slug check 30 / min per user; public quiz calls 120 / min per IP per quiz | Phase 14 | No |
| D12 | Reserved slugs | `new edit preview admin api www app quiz login register` | Phase 5 | No |
| D13 | "Close to a Free plan limit" in admin | at least 80% of any of the three limits | Phase 11 | No |
| D14 | Email provider | Resend | Phase 12 | No |
| D15 | Keep contact form messages in the database | Yes | Phase 12 | No |
| D16 | Response retention | Keep until the person deletes them or the quiz/account (as the design says) | — | No |
| D17 | Which pages can be a condition source | choice and number only | Phase 2 | Maybe |
| D18 | Reordering a page above a page it depends on | **Block the move** with a toast ("Move X after Y first") | Phase 5 | Minor (toast) |
| D19 | Admin "Responses collected" number | finished responses only | Phase 11 | No |
| D20 | Test inbox for development and QC (no Docker, so no local mail catcher) | Mailtrap sandbox over SMTP (free); check its current free limits | Phase 4 | **Done 2026-11-07** (free: 50 emails/month, 1 sandbox) |
| D21 | Public repo: which plan files stay in the repo | Keep technical plan files; ask before pushing business/marketing notes | Phase 1 | No |

**D1 and D2 (2026-11-08):** both built in code. D1: the verify screens (`VerifyEmailView`, `/verify-email/expired`) and the verify email (`emails/verify.tsx`, rebuilt into `supabase/templates/confirmation.html`) say **1 hour**; the email-change link (our own table) stays 24 hours. D2: `LoginGoogleExists` is removed from the code (login state `google-exists`, its banner and its `/dev` link). Still owed in Claude Design: update `VerifySent`, `VerifyExpired`, `EmailVerify`; delete the two `LoginGoogleExists` boards; update `BehaviorRules` (checklist H7).

**Status of the decisions on 2026-11-08 (built in code):** D5 noindex (website indexable, private pages and quiz links not), D6 Vercel Web Analytics (loads only on Vercel), D11 rate limits (`server/rate-limit.ts`: register 10/h, forgot 5/h, contact 5/h, public quiz calls per minute, sign-in lock 5 tries/15 min, and since 2026-11-08 the live web-address check 30/min per person; when it is refused the address field just stops checking, no message), D13 near-limit at 80%, D15 contact messages kept in `contact_messages`, D18 blocked reorder, D19 admin responses = finished only. Still open for the owner: D3, D4, D7, D10, D12, D14, D17, D21 and the design change for D1 and D2.

---

---

## 12. Execution order (master checklist)

**Why this order:** (1) accounts and the repo first so nothing is lost; (2) the pure logic and shared pieces first because everything else uses them; (3) the **whole UI with dummy data** next, so the owner can click through the real product and approve it before any backend exists; (4) then the backend, feature by feature, replacing dummy data with Supabase one area at a time; (5) hardening, QC and release last.

Tick a phase only when its **done-when** list is true and its tests pass. One branch and one pull request per phase (`phase-2-ui`); CI must be green; the owner checks the Vercel preview.

- [x] **Phase 0** Accounts, repo, decisions (no code; the decisions and design gaps still open are listed in `project_checklist.md` B and D)
- [x] **Phase 1** Clean-up and foundation (tooling, tokens, shared logic with unit tests)
- [ ] **Phase 2** The whole UI with dummy data, all links connected -> **UI freeze**
- [x] **Phase 3** Supabase: local setup, database, security rules, tests (database, RLS, storage and 115 tests done 2026-11-07 on branch `phase-3-supabase`; left: `repos/supabase` skeletons, optional dev seed)
- [x] **Phase 4** Register, login, accounts base (real auth)
- [x] **Phase 5** Quizzes and the editor for real (list, create, autosave, publish, slug, limits)
- [x] **Phase 6** Pictures (media library)
- [x] **Phase 7** The public quiz and saving answers
- [x] **Phase 8** Responses: summary, individual, export, delete
- [x] **Phase 9** Edit with AI for real (the owner still tries real AI chats)
- [x] **Phase 10** Account settings complete
- [x] **Phase 11** Admin area
- [ ] **Phase 12** Email for real: code done, needs the owner's Resend account and DNS (see Phase 12)
- [ ] **Phase 13** Website completion: SEO, icons, analytics done; final copy and legal need the owner (front-end update tasks, SEO, analytics, legal)
- [ ] **Phase 14** Hardening: code and tests done; backups drill, uptime monitor, audit need the owner's accounts (spam, rate limits, headers, monitoring, backups, performance, accessibility)
- [ ] **Phase 15** Full QC run, bug fixing, cleanup
- [ ] **Phase 16** Release to production, then the first week

Every task below must also satisfy the **Definition of Done** (DoD):
1. Matches the design board(s) for every state, on desktop and phone where the board exists.
2. All text from `strings.ts` or `content/`; all URLs from `routes.ts`; all colors from tokens; only `components/ui` primitives.
3. Nothing duplicated (rule R2). Strict types. No dead code.
4. Keyboard works, focus is visible, reduced motion respected.
5. Unit tests for new logic; QC script updated or added for the user-visible behavior.
6. `npm run lint`, `typecheck`, `test` pass; plan files updated.

---

### Phase 0 — Accounts, repo, decisions (no code)
Owner and Code together.
- [x] Owner: GitHub repo exists (public), Supabase project `quiz-dev` exists (Singapore). No Docker. Still to think about: the domain (D9). (Rows 1–3 in section 10.)
- [ ] Code: confirm section 11 decisions D1, D2, D17, D18 with the owner. Where a design change is needed (D1, D2), do it in Claude Design now and update `BehaviorRules`.
- [x] Code: close the known design gaps G1–G8 (section 13) in Claude Design, or agree to defer each. _Deferred in writing 2026-11-08: all gaps are built as simple versions without a board and listed in `project_checklist.md` section H and 13.4; the owner designs them later._
- [ ] Code: optional design snapshot into `docs/design-snapshot/` (copy of all `project/*.dc.html` plus `canvas.json`, folder name with the artifact version).
- **Done when:** repo and the dev Supabase project exist (yes), decisions logged in section 11, design gaps closed or deferred in writing.

### Phase 1 — Clean-up and foundation
- [x] `git init`, first commit = the repo exactly as it is now (history of the starter), add the remote, push `main`. Then work on branch `phase-1-foundation`.
- [x] Delete old code and dependencies per section 9 (owner confirms the list first). Fix `next.config.ts`.
- [x] Tokens in `globals.css` (`@theme`): colors, radii, spacing, shadows, motion; Inter via `next/font`; reduced-motion global rule; update `components.json`.
- [x] Folder skeleton from 4.4; ESLint rules that protect the architecture: components cannot import `@/server/*` (only server actions/pages can), no `process.env` outside `env.ts`, `import "server-only"` required in `src/server/**`, no raw hex colors in `components/**`.
- [x] Shared modules with unit tests: `routes.ts`, `strings.ts` (start with the strings of the shared UI), `env.ts`, `format.ts`, `slug.ts`, `ids.ts`, `plan/limits.ts`, `utils.ts`.
- [x] **Quiz core with unit tests** (pure TypeScript, no UI): `schema.ts` (+ page-type registry skeletons for the 7 types), `conditions.ts`, `diff.ts`, `validate.ts`, `time-estimate.ts`, `units.ts`, `templates/*` (the 3 templates as valid documents), `ai/import.ts` and `ai/export.ts` (parser, normalizer, prompt builder). These are the heart of correctness; test them hard (see 14.2).
- [x] Test tooling: Vitest, Playwright (one smoke spec), scripts `lint`, `typecheck`, `test`, `qc`, `release-check`.
- [x] GitHub Actions CI: install, lint, typecheck, unit tests, build. Protect `main` (PRs only).
- [x] Rewrite `plan/project_structure.md` for the new architecture (routes, folders, registry, repos). Replace `README.md`.
- _Status 2026-11-08: all done. ESLint now enforces the architecture (`eslint.config.mjs`): no raw hex colors and no `process.env` outside `lib/env.ts` in components, components cannot import server-only code; `src/server/architecture.test.ts` checks the `server-only` and `use server` markers. CI is `.github/workflows/ci.yml`; `npm run release-check` exists._
- **Done when:** `npm run lint && npm run typecheck && npm test && npm run build` are green locally and in CI, and the quiz-core unit tests cover the cases in 14.2.

### Phase 2 — The whole UI with dummy data
Dashboard tab handover for a fresh session: `docs/handover-dashboard-ui.md` (slices A to D = items 2.0, 2.1, 2.5, 2.6, 2.8, 2.9). Goal: the owner can click through **every** screen of the design in a browser, on dummy data, with every link and button leading somewhere real. No Supabase yet (`DATA_MODE=mock`).

Setup
- [x] 2.0 **Mock layer:** _(Done 2026-11-07, Slice A: only `QuizzesRepo` and `ProfilesRepo` so far; `lib/plan/limits.ts`, `lib/slug.ts`, `lib/format.ts`, `lib/quizzes/list.ts` with 29 unit tests (`npm test`). The mock runs in the browser (localStorage); screens use hooks in `src/hooks`; more repos come with their slices.)_ `src/server/repos/ports.ts` (the interfaces), `repos/mock/*` and `src/data/mock/*`: a few people, quizzes in every state, responses (finished and unfinished, with conditional pages and a removed question), pictures (use a handful of neutral stock images stored in `public/mock/`), an admin list of about 40 people. State persists in `localStorage` so refresh keeps edits. The mock repos call the **same** `lib/` functions (limits, slug rules, validation, diff) as the real code will.
- [x] 2.0b _(Done 2026-11-08: a small "Test links and who is logged in" link sits on every dashboard and admin screen in mock mode, not in production.)_ A **dev-only session switcher** (hidden in production builds): logged out / normal person / admin / suspended / unverified, so every flow can be clicked. _Started 2026-11-07: `/dev` (list of every website test link) and `/dev/session?as=user|admin|out` (cookie `mock_session`, read by `src/server/session.ts`). Suspended and unverified come from the test accounts on the Log in screen. Still to do: link the session switcher from the dashboard and admin layouts._

Build, in this order (each item = its boards, all states, desktop + phone where the board exists):
- [x] 2.1 **UI kit** _(Done 2026-11-07: Button `shape=box`, Input/Select/Textarea box, Pill, Avatar, ProgressBar, Skeleton, EmptyState, Switch, Checkbox, Radio, Tabs, Table, Dialog, Menu, Popover, Toast, SaveStatus; Radix for the accessible parts; `/dev/ui` shows them. Not built yet: list rows (editor slice) and Segmented (no board).)_ (`components/ui`) from `UIFoundations`, `UIButtons`, `UIFeedback`, `UINavigation` + a dev-only page `/dev/ui` showing every component and state (also the visual QC page). _Started 2026-11-07: the pieces the website needs are built (`Button`/`ButtonLink`/`DisabledButton`, `Input`/`Textarea`/`Field`, `Banner`, `Card`, `ToggleChip`, `RichText`, icons). Dashboard-style pieces (10 px buttons, Switch, Checkbox, Radio, Tabs, Dialog, Menu, Toast, Table, Skeleton, Pill, Avatar) and `/dev/ui` are still to do._
- [x] 2.2 **Layouts and shared components:** site layout (`SiteNav`, `SiteNavIn`, mobile menu, `SiteFooter`, `CtaBand`, `SiteLogo`), auth split layout, dashboard layout (`DashAccount`, `AccountMenu`, `AccountMenuAdmin`, `DashPhone`), admin layout, quiz layout. _Done 2026-11-07: site layout (one `SiteNav` for computer, phone and logged-in, with the phone menu and the account menu), footer, call-to-action band, logo, auth split layout. Update 2026-11-07: the dashboard shell (`DashShell`, `PhoneGate`), the quiz frame (`QuizFrame`) and the admin shell (`AdminShell`) are done too, so all layouts exist._
- [x] 2.3 **Website:** _(Review round 1, 2026-11-07, design version 69: FAQ now full width on Home and Pricing, more padding in FAQ rows on phones, more space between the link field and "Copy link" in step 2; code: smooth hovers, FAQ opens and closes with a slide, phone menu fades and slides in, smooth scroll to #how and #features.)_ `Home`, `WebPricing`, `Contact` (+ `ContactSent`, `ContactError`), `Terms`, `Privacy`, `NotFound`, `Error500`, `Maintenance`. Copy in `src/content`. _Done 2026-11-07 (built in one responsive component per page, checked at 390, 768, 1100 and 1440 px). Open: the `MAINTENANCE_MODE` switch in the middleware (only the screen exists at `/maintenance`); fidelity review against the boards (2.12); the Contact "sent" card replaces the form inside the page (the board shows only the card)._
- [x] 2.4 **Auth screens:** all states listed in 8.2, driven by the mock session and a mock "what happens" (for example typing a known wrong password shows `LoginError`). _Done 2026-11-07: all 17 desktop boards and their phone copies. Mock rules and test accounts are in `src/data/mock/accounts.ts` and listed on `/dev`. "Already logged in -> dashboard" redirect on Log in/Register is NOT switched on yet, because the old `/dashboard` (old AuthGuard) would bounce back to `/login` in a loop; switch it on with 2.5. Register and Reset use the browser's validation messages (gap G9)._
- [x] 2.5 **Quiz list and new quiz:** _(Done 2026-11-07 except the "Full" card state (G8). Dashboard layout `(app)`, phone gate at 900 px, logged-out redirect, "already logged in" redirect on Log in and Register turned on. Chosen by Code because the design has no board (new gaps G13 to G16): Rename dialog, a quiz picker inside "A copy of a quiz I already have", the usage meter as a popover on "3 of 5 quizzes", toast words, generic error toast, "Email me a link" sent state.)_ `Quizzes`, `QuizMenu`, `Empty`, `NewQuiz`, `TemplateContents`, `LimitStates`.
- [x] 2.6 **Editor:** _(Done 2026-11-07 in Slices B and C. B: quiz core `lib/quiz/*`, editor store, autosave, shell, page list with drag and drop, canvas, panels for all 7 page types, Add page, Page menu, delete and limit dialogs. C: display conditions (panel, plain-words sentence, blocked reorder), field errors after leaving a field and all errors after Publish, "Fix this" on pages, Publish, PublishProblems, Share and ShareQuiz, Quiz settings drawer (name, live web address check, accepting responses, locked Custom plan rows, delete quiz), Add a picture (upload shrunk in the browser, My pictures, `public/mock/`), Edit with AI end to end (`lib/ai/prompt|export|import.ts`, 15 unit tests including the round-trip rule). Still open: "Try it" has no page until the quiz runtime (2.7); the Edit with AI check for "nothing would change" is built from a guess (G20).)_ shell, page list, canvas, panels for the 10 page-type boards, `AddPage`, `PageMenu` (+ drag and drop), `Conditions`, `MainEmpty`, `EditorStates`, `Saving`, `States`, `DashErrors`, `PublishProblems`, `Publish`, `Share`, `ShareQuiz`, `Settings`, `AddPicture` (media dialog on mock pictures), **Edit with AI** (`AiHelper`, `AiHelperCheck`, `AiHelperStates`) working end to end on the mock quiz (copy, paste, check, apply, undo), undo stack, autosave simulation.
- [x] 2.7 **Quiz runtime:** _(Done 2026-11-07. `lib/quiz/runner.ts` = the rules of BehaviorRules as pure functions (checks, next, back, progress, what is saved, resume) with 15 unit tests; `lib/quiz/calendar.ts` (+5 tests); `hooks/use-quiz-runner.ts` = the screen's state and the save/resume flow; `components/quiz-runtime/*` = QuizFrame (phone full screen, computer centered card), TopBar, page views for the 7 page types, date calendar, status screens (closed, not published, not found, error, Welcome back, already finished), save-error with Try again, preview bar. Data: new `RunnerRepo` in `server/repos/ports.ts` with a mock that writes real responses into the dummy data (so Responses shows them) and counts opens once per tab session. Routes: `/quiz/[slug]` and `/dashboard/[quizId]/preview` (outside the dashboard frame). Test links and two new switches (next save fails, next quiz link fails) on `/dev`. Theme: six `--quiz-*` variables with the default slate set, `QuizTheme` in the repo shape (the mock always sends the default). Checked by hand in the browser on phone and computer width: full Body Reset run, conditional page, range errors, date calendar, resume, take it again, closed / not published / not found, save error and retry (no double response), preview writes nothing, a kitchen-sink quiz with pictures, several choice, email check, Loading and End button. Production build clean; the public quiz page is 163 kB first load with no editor code. Open: the editor canvas still has its own still drawing (`components/editor/canvas/page-views.tsx`) instead of using these views (planned "one runtime, three uses", do it with the next editor change); wording and small rules with no board are G23.)_ `QuizRunner` and every `FE*` board, preview mode, all status screens, resume, already-done, themes.
- [x] 2.8 **Responses:** _(Done 2026-11-07, Slice D: `lib/responses/*` (summarize, individual filters, CSV/XLSX/JSON export with formula protection and removed-question columns, 17 unit tests), dummy responses in `data/mock/responses.ts` (Body Reset has 128 finished), Summary with plain bars (Recharts was not needed and was removed), Individual with search, date range, include unfinished, previous/next and Delete, export menu, "Delete all responses" with DELETE, the 450 and 500 response banners, empty state. Export uses the date range, not the search box.)_ `Report` (Summary with real computed numbers from the mock responses), `Responses` (Individual), `ResponsesDelete`, export downloads (CSV/XLSX/JSON of the mock data; the same export code the real one will use).
- [x] 2.9 **Account:** _(Done 2026-11-07, Slice D: `/account` with name autosave, email change with a waiting state, Change/Set password dialog, Google row, Delete account with DELETE and then `/goodbye`; Google-only variant via `/dev`.)_ `Account`, `AccountGoogleOnly`, `AccountEmail`, `AccountPassword`, `AccountDelete`, `AccountDeleted`.
- [x] 2.10 **Admin:** _(Done 2026-11-07. Routes `/admin`, `/admin/users` (opens on `?filter=unverified` from the Overview counter) and `/admin/users/[userId]` in route group `(admin)`; the layout lets only admins in and shows `AdminNoAccess` to everyone else (logged out too) with no hint of the content, `noindex`. Logic in `lib/admin/people.ts` (search, filters, 8 per page, overview numbers, "close to a limit" = 80% of any Free limit (D13), CSV with formula protection, limit box parsing) with 12 unit tests. New `AdminRepo` port and a mock (`server/repos/mock/admin.ts`, about 40 made-up people in `data/mock/admin.ts`) that keeps plan changes, suspend, restore and delete in localStorage and writes each to a log like `admin_log`; "Reset the dummy data" restores the people. Screens: Overview (6 numbers, 30-day bar chart, two counters, newest people), Users (search, filter, sort box, table, pages, Download as CSV), one person (details, Plan with Free/Custom, switches, domain, three limits with "Free: N" hints, Save plan with toast, their quizzes, private notes, Careful), Suspend dialog, Restore banner, Delete dialog (type the email), own account disabled. Admin pages use the dashboard shell, so phones get "works best on a computer". Checked by hand in the browser: visitor and normal person see no-access, admin sees all, filters and search, paging, CSV file (42 lines), plan save with a bad limit, suspend and restore, delete with a wrong and a right email, own account, suspended person, person not found. Production build clean. Switching a person to Free clears their switches, domain and limits on purpose (`getLimits` uses the limit boxes whatever the plan). Still open: the "Near a limit" filter (G7) and the wording and states in G24.)_ `AdminOverview`, `AdminUsers`, `AdminUser`, `AdminDialogs`, `AdminNoAccess`.
- [x] 2.11 **Email templates:** _(Done 2026-11-07. `emails/` holds `layout.tsx` (grey page, white card, wordmark, footer, pill button, "copy this address" block, all colors written out once because inboxes ignore style sheets), the five templates (`verify`, `new-address`, `reset`, `password-changed`, `contact`) and `index.tsx` (one list with subject, board, when it is sent, sample details, `renderEmail(id)`). Package `@react-email/components`; alias `@emails`; whole addresses come from `SITE_URL` (`https://quiz.basrh.com`, D9) in `lib/routes.ts`. Preview page `/dev/emails` (linked from `/dev`) draws each email in a frame with its From/To and Subject line like the boards. 8 tests (`emails/emails.test.ts`, run by `npm test`): every email renders, the right words, 24 hours / 1 hour, links, and visitor text in the contact email is never turned into markup. Not done here (Phase 12): sending, the Supabase Auth HTML export with its own placeholders, the sender address. Open: the sender `hello@quiz.basrh.com` is our guess (the boards show `hello@quiz.com`); the wordmark is plain bold text because inboxes hide pictures and inline SVG (a hosted PNG logo can replace it at launch); the Needs row of the contact email is left out when nothing was picked; no board for the "Hi {name}" when a person has no name.)_ in `emails/` with React Email (`EmailVerify`, `EmailNewAddress`, `EmailReset`, `EmailPasswordChanged`, `EmailContact`) and a preview page (dev only).
- [x] 2.12 **Link audit:** _(Done 2026-11-08: `npm run qc:links` (Playwright, `tests/qc/link-audit.spec.ts`) crawls every page as a visitor, a normal person and the admin (56, 59 and 69 pages), presses 43, 220 and 330 buttons, and reports no dead link, no "#" link, no script error, no failed request; the only finding was the missing favicon, now built. `npm run qc:a11y` scans every main screen for serious accessibility findings and passes. The design fidelity review was done by hand when each area was built; the owner's "UI approved" is the last step and waits for the Vercel preview, 2.13.)_ **Earlier notes:** _(Dashboard review done by hand 2026-11-07, not yet the Playwright spec: production build is clean; every link on the quiz list, editor, responses and account pages answers 200 except "Try it" `/dashboard/[id]/preview`, `/quiz/[slug]` (Share, "Open the quiz") and `/admin` (account menu, admins only), which wait for 2.7 and 2.10. Update 2026-11-07: "Try it" and `/quiz/[slug]` now answer 200 (2.7 done); and `/admin` answers 200 for the admin (2.10 done), so every link in the dashboard now has a page. Every text of the 40 dashboard boards was searched in the code: all found except sample data and board captions. Fixed in the review: the blank-quiz hints of board MainEmpty, 44 px drag handle, focus ring on the web address field, two unused leftovers removed. Open: raw hex colors remain in decorative website components (gradients in `cta-band`, `auth-panel`, `insights`, `hero-backdrop`, `section-heading`) from the website session.)_ a Playwright spec crawls the mock app: visits every route in `routes.ts`, clicks every link and button in every state it can reach, and fails on a 404, a `#` link, a dead button or a console error. Plus a manual **fidelity review**: open each route next to its board and fix differences.
- [ ] 2.13 Deploy the preview to Vercel (`DATA_MODE=mock`, hidden from search engines, not linked anywhere).
- **Done when:** the link audit passes, every board in Appendix A is built and matches, the owner has clicked through everything on the Vercel URL and says **"UI approved"**. From now on UI changes follow rule R1.

### Phase 3 — Supabase: local setup, database, security rules, tests
- [x] `supabase init`, `supabase link`; `config.toml`: email confirmations on, password minimum 8, link lifetime per D1 (working default 3600 s, D1 not confirmed yet), **double confirm of email changes off**, site URL and redirect URLs (`http://localhost:3000/**`; the Vercel preview wildcard is added later), API exposed schemas = `public` only. Pushed with `supabase config push` (2026-11-07). Still open for Phase 4: SMTP = Mailtrap sandbox, Google provider. (Detailed first-time steps: `docs/handover-supabase-setup.md`.)
- [x] Migrations for everything in section 6 (types, tables, indexes, triggers, functions/RPCs, RLS, storage bucket and policies), the `private` schema for admin helpers, `pg_cron` cleanup jobs (works on Free). Applied to `quiz-dev` (7 files in `supabase/migrations/`). `dev-seed.sql` (optional) is **not** written yet.
- [ ] Generate `src/types/database.ts` (**done**); add `repos/supabase/*` skeletons typed from it (**not done**, belongs with the UI/data-layer work).
- [x] **RLS and logic tests** as Vitest integration tests (`tests/db/*.test.ts`) against the dev project: see 14.3. `npm run test:db` = 115 tests green; `npm run db:check` green.
- [x] Link the staging project and `db push`: staging uses the same project `quiz-dev` (decided), so nothing more to link.
- **Done when:** `supabase db push` applies every migration to an empty dev project, the database tests pass, and a script confirms every table has RLS on.

### Phase 4 — Register, login, accounts base
- [x] **Mailtrap sandbox for dev emails (D20), done 2026-11-07:** sandbox `quiz-dev` (free plan: 1 sandbox, 50 emails per month; the inbox keeps 10 messages); `[auth.email.smtp]` enabled in `config.toml` and pushed (`email_sent` rate limit 10 per hour); `tests/mail/mailbox.ts` helper (Mailtrap API) and `npm run test:mail`. Run `test:mail` sparingly (1 email each).
- [x] Supabase clients (`src/server/supabase/server.ts`, `admin.ts`, `middleware.ts`), `src/middleware.ts` (maintenance switch `MAINTENANCE_MODE=on`, session refresh, logged-out people on `/dashboard` or `/account` go to `/login?next=...`), `server/auth/guards.ts` (`requireUser`, `requireAdmin`). The `(app)` layout and the admin layout check again. _Done 2026-11-08._
- [x] Actions and routes: register (same answer whether or not the address exists), login with the 5-tries lock (`login_attempts`, salted address hash), logout, forgot and reset password, resend verification, Google (`/auth/callback`), `/auth/confirm` (accepts both our own `token_hash` template and Supabase's standard `code` link), suspended people refused, `next` limited to this site (`lib/auth-rules.ts`). _Done 2026-11-08._
- [x] `handle_new_user` verified: profile with the name for password sign-ups (browser test); Google sign-ups use `full_name` (trigger covered by the database tests, real Google login needs a person).
- [x] The mock session is the default only while `NEXT_PUBLIC_DATA_MODE` is not `supabase`; the switcher link bar shows in mock mode only.
- [x] **Done when:** QC-02 and QC-03 pass (`tests/qc/real-auth.spec.ts`, 13 scenarios on the dev project); RLS tests still pass; the service key is read only in server code (`import "server-only"`, production bundle checked by QC-20).
- [ ] **Owner action:** the two auth emails (verify, reset) use our designed templates only after `node scripts/with-env.mjs npx supabase config push` (it changes 4 template fields and `enable_manual_linking`; the CLI asks for consent). Until then Supabase's standard emails are used and the standard `code` link is handled, so nothing breaks.

### Phase 5 — Quizzes and the editor for real
- [x] `server/actions/quizzes.ts` with `repos/remote`: list, create (blank, template, copy), duplicate, rename, delete (the database holds the old address 30 days), open/closed, `saveDraft` (versioned in the database), `publish` (strict check first, then the database re-checks the page count), `setSlug`, live address check (`slug_available`), limits (dialog, server, database). The editor, autosave, offline bar, undo and "N changes not published" run unchanged on it. _Done 2026-11-08._
- [x] `NEXT_PUBLIC_DATA_MODE=supabase` switches every area at once (quizzes, pictures, responses, account, admin, public quiz); the mock stays for the UI phase and the link audit.
- [x] Conflict dialog (G1, no board, built 2026-11-08): `QuizSummary.version` (the database `draft_version`); the editor's autosave sends the version it last saw (`SaveDraftOptions.baseVersion`); a save that is behind returns `conflict` and the editor shows `ConflictDialog` ("Load the newest" reloads the page, "Keep my version" saves with `keepMine`). Rename and Publish still go on top of the newest version. The mock raises `version` on every page save and has the `/dev` switch "Next editor save says changed somewhere else". D18 (blocked reorder) is done in the editor.
- [x] **Done when:** QC-04, QC-05, QC-06, QC-08 and QC-09 pass (`real-quiz.spec.ts`, `real-editor.spec.ts`): create, the 5-quiz limit, autosave surviving a reload, publish blocked without a question, Share link, a page shown only to some people, two people on the same address.

### Phase 6 — Pictures
- [x] `server/actions/media.ts`: the browser shrinks the picture, the server checks type and the 5 MB size again, stores it in the person's own folder of `quiz-media`, then adds the library row; public address from `lib/media-url.ts`; Server Actions body limit 8 MB; `next/image` host for Supabase. Pictures show in the editor, Try it and the public quiz (`loadPublic` returns only the owner's pictures that the quiz uses). _Done 2026-11-08._
- [x] **Done when:** QC-07 passes (upload through the dialog, row and file in the person's folder, public address opens); other people cannot touch the folder (storage database tests, QC-13).

### Phase 7 — The public quiz and saving answers
- [x] `GET /api/q/[slug]`, `POST .../open`, `.../start`, `POST /api/r/[id]/answer`, `/finish`, `/resume`: only the published copy leaves the server; secret token per response (only its hash is stored); every answer is checked against the published page and the saved question and option texts come from it (`lib/quiz/progress.ts`, 9 tests); answers of hidden pages are dropped; finishing needs every answer that was shown; rate limits by address hash (`rate_limit_hit`); the 500th slot is taken atomically (`finish_response`); closed, full, suspended owner and not published all look the same to people. OG share picture per quiz (`/quiz/[slug]/opengraph-image`, board SocialQuiz). _Done 2026-11-08._
- [x] **Done when:** QC-10 passes on a phone-size touch browser; resume, closed, wrong token, made-up answers, wrong quiz's pages and the response limit are tested (`real-quiz.spec.ts`). Offline save failure is covered by the "We couldn't save your answer" screen (mock switch) and the unit tests of the runner.

### Phase 8 — Responses: summary, individual, export, delete
- [x] `server/actions/responses.ts` reads every page of responses for the owner only (1,000 at a time), delete one and delete all; Summary, Individual and the three exports already ran on the same data shapes. _Done 2026-11-08._
- [x] **Done when:** QC-11 (CSV downloaded from the Responses page contains the words people chose) and QC-12 pass; the numbers are unit tested (`responses.test.ts`, 17 tests); deleting responses lowers `finished_count` (database trigger test).
- [ ] The export runs in the browser from the loaded responses; a streaming server route (`/api/quizzes/[id]/export`) is not needed below a few thousand responses and is left for later.

### Phase 9 — Edit with AI for real
- [x] The dialog, `lib/ai/*` and the check run on the real draft (the draft goes through `saveDraft` like any edit, as one Undo step); the private name is never changed by the AI. QC-15 passes: sentences instead of a quiz are refused and change nothing; a quiz inside chatter in a code box is checked and applied. _Done 2026-11-08._
- [ ] **Owner action:** try it with real AI chats (ChatGPT, Claude, Gemini), 5 typical changes each, and tell us what failed so the prompt text can be improved. The prompt is generated from the final schema (`lib/ai/prompt.ts`, unit tested including the unchanged round trip).

### Phase 10 — Account settings complete
- [x] `server/actions/account.ts`: name, email change (our `email_changes` table: link mailed to the NEW address, 24 hours, cancel, resend at most once a minute, `/auth/email-change/confirm`), change password (current password checked on a throwaway client, other devices signed out, "Password changed" email), set password (Google-only), connect Google (needs `enable_manual_linking`, set in `config.toml`, applied by the owner's `config push`), delete account (pictures, then the account; quizzes and answers follow by the database). _Done 2026-11-08._
- [x] "Disconnect Google" (G6, no board, built 2026-11-08): `disconnectGoogleAction` (`unlinkIdentity`), `AccountState.canDisconnectGoogle` (Google connected, a password exists, and Supabase still has 2 identities, because it never removes an account's last one), a button and a confirm dialog on Account. Known limit: a person who began with Google and later set a password cannot disconnect it.
- [x] The "confirm your new email" link lands on `/account?email=changed` (toast) or `/verify-email/expired?for=email-change` (G5, no board, built 2026-11-08).
- [x] **Done when:** QC-14 passes (name saved, password change with a wrong then the right current password, the old password stops working and the email arrives, delete removes the person and their quizzes, the email-change link works once).

### Phase 11 — Admin area
- [x] `server/actions/admin.ts` (`requireAdmin` first; reads use the service key and only counts and profile facts; people are put together in memory, fine to a few thousand people, a database function replaces it later): overview, people list, CSV, person, plan and limits (Free clears the extras), notes, suspend (profile + ban), restore, delete (typed email, pictures removed), own-account protection, `admin_log`. _Done 2026-11-08._
- [x] Verified: login blocked for a suspended person, their quizzes show closed, restore brings login back; a normal person and a stranger get the no-access page. **Done when:** QC-16 passes (`real-account.spec.ts`, `real-auth.spec.ts`).
- [x] The Users table has the filter "Near a limit" (G7, no board, built 2026-11-08); the Overview counter opens it (`?filter=near-limit`).

### Phase 12 — Email for real
- [x] One sender (`server/email/send.ts`): Resend when `RESEND_API_KEY` is set, the Mailtrap test inbox in development, retries on "too many requests". The "Confirm your new email", "Password changed" and contact emails are rendered from `emails/` and sent by it. The contact form saves a copy first (`contact_messages`), is rate limited (5 an hour), and mails the owner with the visitor as reply-to. QC-17: the password-changed and contact emails were read back from the Mailtrap inbox. _Done 2026-11-08._
- [ ] **Owner actions:** a Resend account and the DNS records (SPF, DKIM, DMARC) for the sending domain; then set `RESEND_API_KEY` and `EMAIL_FROM`; custom SMTP in Supabase for the two auth emails; `config push` (templates); send all five emails to real inboxes (Gmail and one more) and look at them on a phone.

### Phase 13 — Website completion (front-end update tasks)
Rule: **any visual or wording change goes through Claude Design first.**
- [x] SEO: metadata base, per-page titles, `sitemap.ts`, `robots.ts` (website indexable, private pages, quiz links and server routes kept out), `noindex` where D5 says, share pictures for the website and for every quiz, favicon, Apple icon and manifest icons from the BrandIcons board. The old portfolio-era "noindex on everything" header was removed. Placeholders `quiz.com` and `yourshop.com` removed from code and content. _Done 2026-11-08._
- [x] Visitor counting (D6): Vercel Web Analytics, cookieless, loaded only when the site runs on Vercel. Maintenance switch (`MAINTENANCE_MODE=on`) in the middleware; 404 and 500 screens exist and are crawled.
- [ ] Final marketing copy, final Terms and Privacy (real company details, lawyer review). **Owner.**

### Phase 14 — Hardening
- [x] Cloudflare Turnstile on Register, Forgot password and Contact: built and switched on by `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` (off without them). Rate limits in one module (`server/rate-limit.ts`): register 10 an hour, forgot password 5 an hour, contact 5 an hour, public quiz calls per minute, plus the sign-in lock. Body-size limit on the public endpoints. _Done 2026-11-08._
- [x] Security headers and a content security policy in `next.config.ts` (production only), tested on the production build by QC-19/QC-21 (no console errors on any main page, nothing can frame the site).
- [x] Sentry (`instrumentation.ts`, `instrumentation-client.ts`): off until `SENTRY_DSN` is set; bodies, cookies and user details are removed before an error leaves. Health check `/api/health`.
- [x] Backups, restore drill steps, rollback and the admin guide are written in `docs/runbooks/`. [ ] **Owner:** the paid Supabase plan with daily backups, the uptime monitor on `/api/health`, and the restore drill itself (needs the production project).
- [x] Performance budgets (QC-20: the quiz page ships no editor, drag-and-drop, chart or spreadsheet code and stays under 900 KB of script) and the accessibility scan (QC-18: every main screen as visitor, person and admin, plus the quiz on a phone, no serious findings). Real keyboard and screen reader checks by a person are still to do. [ ] `npm audit` review and a secret scan before release.

### Phase 15 — Full QC run, bug fixing, cleanup
- [x] CI (`.github/workflows/ci.yml`): lint, typecheck, unit tests, build, link audit and, on `main`, the database tests. `npm run release-check` = lint, typecheck, unit tests, build.
- [x] The browser tests found and fixed real problems on the way: the address-is-free hint vanished after saving, the progress bar had no accessible name, the logo link name did not contain its visible word, a content-security-policy typo, and visitor counting loading outside Vercel.
- [ ] Two clean runs in a row of every QC script on the staging deploy; cross-browser smoke (WebKit and Firefox; today Edge/Chromium only); a real iPhone and Android check of the public quiz. **Needs staging and phones.**
- [ ] Decide whether the mock layer stays as a demo mode. The editor canvas now uses the real quiz views (one runtime), so one old copy of the page drawing is gone.
- [ ] Final design fidelity review of every board against the built screen (done by hand for the quiz runtime, admin and emails when they were built; the rest in the earlier dashboard review).

### Phase 16 — Release
- [ ] All of it needs the owner's accounts: production Supabase (paid), Vercel and the domain, Resend, Turnstile, Sentry, Google production redirect URIs. The exact steps are in `docs/runbooks/deploy.md`.
- [ ] Deploy with `MAINTENANCE_MODE=on`, smoke test, promote the owner to admin (`docs/runbooks/admin.md`), switch maintenance off, submit the sitemap, tag `v1.0.0`. Rollback: `docs/runbooks/rollback.md`.
- **First week:** watch Sentry, Supabase logs, Resend delivery, sign-ups and the admin overview daily; fix what real people hit; then plan custom domains (D10) and the backlog.

---

## 13. Known design gaps and things not mentioned yet

### 13.1 Design gaps (close in Claude Design before the phase that needs them)
These are needed by the code but are **not in the design yet**. **Status 2026-11-08:** every gap below is now built in code as a simple version (rule R1, temporary exception) and listed for the owner in `project_checklist.md` section H and in 13.4. The rows say what was missing; where a row says "not built", it is built now.

| ID | Gap | Needed by |
|---|---|---|
| G1 | **"This quiz was changed somewhere else"** dialog (saving from a second tab/window returns `conflict`): text, buttons "Reload" / "Keep my version" | Phase 5 |
| G2 | **Edit with AI check with no changes** ("Nothing would change"), shown when the pasted answer equals the current quiz | Phase 9 |
| G3 | Picture library management: deleting or renaming a picture (decided: **not in v1**, but a library that only grows should be mentioned in the design notes) | Phase 6 |
| G4 | Toast text when a move is blocked by a display condition (D18): "Move X after Y first" | Phase 5 (minor) |
| G5 | Email change: what the person sees after opening the confirm link (success toast on Account) and when the link expired (reuse `VerifyExpired`, wording "email change") | Phase 10 |
| G6 | **Disconnect Google** (button, confirm, state) when the account also has a password | Phase 10 |
| G7 | Admin Overview counter **"Close to a Free plan limit"** links to Users, but Users has no matching filter. Add a filter "Near a limit" or make the counter not a link | Phase 11 |
| G8 | Quiz card state **"Full"** (response limit reached) in the quiz list | Phase 5 |
| G9 | **Field errors on Register and Set a new password.** The design only shows field errors on Contact. Code uses the browser's own validation messages for now (required, valid email, 8+ characters). Needed: wording and look for "name missing", "email not valid", "password too short", and **"the two passwords are not the same"** (the code uses that sentence as a placeholder) | Phase 4 |
| G10 | **Phone menu when logged in.** `SiteNavMobileOpen` only exists for logged-out people. Code shows the same four links without "Log in" and "My quizzes" as the big button. There is also no way to log out from the website on a phone (the account menu is computer only) | Phase 4 (minor) |
| G11 | **Reset password / Forgot password / Verify "Send again"** have no "sending..." or "we couldn't send it" state; the contact form has a button spinner only (UI kit "Loading") | Phase 4, 12 |
| G12 | **Account menu "Account settings"** and **404 "Go to my quizzes"** point at pages that belong to the Dashboard tab (`/account`, `/dashboard`). A logged-out person who presses "Go to my quizzes" lands on the login screen: confirm that is the wanted behavior | Phase 2.5 / 2.9 |
| G13 | **Rename quiz** dialog (card menu) is not designed; built like New quiz (name field, Cancel, Save) | Slice A |
| G14 | **"A copy of a quiz I already have"** needs a way to pick which quiz; built as a dropdown inside the row | Slice A |
| G15 | **Usage meter** is not placed on any screen; built as a popover that opens from "3 of 5 quizzes · Free plan" | Slice A |
| G16 | **Toasts and states with no board:** "Link copied", "Quiz renamed/duplicated/closed/opened/deleted", generic error toast, phone "Email me a link" sent state (button says "Check your email") | Slice A |
| G17 | **Editor details with no board:** the page-list title when a page has no title (shows the page kind), the "Edit last page" heading for End pages, the date answer box on the canvas ("Day / Month / Year"), the loading-step done marks, the toast for a blocked move (G4: "That move would make a condition look at a later page."), and "Add pictures to the answers" showing empty picture slots until the media dialog exists | Slice B |
| G18 | **Publish dialog on the first publish** has no board (the design only shows "You changed N pages since the last time you published"); built as "Publish your quiz?" with "Your quiz has N pages." | Slice C |
| G19 | **Wording with no board:** field errors for title, message, loading step, number range, button text and condition order; web address errors other than "taken" (invalid, reserved); a file that is not JPG/PNG/WebP in the picture dialog; "Add a multiple-choice or number question before this page to use conditions."; the picture buttons when a picture is set (Change, Remove) | Slice C |
| G20 | **Edit with AI check with nothing to change** (same as G2): built as a small "Nothing would change" message with Back | Slice C |
| G21 | **Responses wording with no board:** a search with no match in Individual, the "Removed questions" group on the Summary, the toast after deleting all responses | Slice D |
| G22 | **Account details with no board:** how a new email address is entered (built: type it and press Enter or leave the field), the wrong-email message, "Set a password" for a Google-only account (the Change password dialog without the current password), "Disconnect Google" (G6, not built) | Slice D |
| G23 | **Quiz runtime wording and small rules with no board** (built by Code, owner to confirm in Design): the messages "Please write an answer to continue." (required text), "Please enter a valid phone number." and "Please enter a number to continue." (required number); the helper line for a number page with only a minimum ("5 or more") or only a maximum; a **single-choice question that is not required** shows a Continue button (otherwise there is no way to skip it); the Loading screen has no Back and Back from the next page skips it; the quiz shows an empty white screen while it opens (no skeleton); "Close preview" goes to the editor of that quiz; a picture added to an End page of any style shows under the text; on a computer the centered card has a minimum height on message screens | Slice 2.7 |
| G24 | **Admin wording and states with no board** (built by Code, owner to confirm in Design): the **Free** state of the Plan card (the board shows only Custom: built as the three Custom settings hidden plus "The Free plan has the standard limits and shows “Powered by Quiz”."); the board text uses "She/her" for Maria, but pronouns are not stored, so the dialogs say "They" and the person’s name; the error under a limit box ("Use a whole number of 1 or more, or leave it empty."); the empty Users search ("No one matches that."); the toasts "Maria Gomez is suspended / is restored / ’s account was deleted"; the loading blocks and the load-failed card on the three pages; "Person not found"; the failed save keeps a red banner with Try again (as the board says) but its words are ours; notes save when the box loses focus (there is no Save button on the board); the Overview "Newest people" shows "Today / Yesterday / date" instead of the board’s "Today, 10:42"; the sort box has the one option "Newest first"; the person page has no "My quizzes" link in its top bar, as the board | Slice 2.10 |
| G25 | **Things built for the real backend that have no board:** the Cloudflare Turnstile widget above the submit button on Register, Forgot password and Contact (a failed check sends Register and Forgot password back to the form without a message, and Contact looks as if it was sent); the 8 MB picture upload limit message is the same "too big" text; the Account page shows no message after the new-address link is opened (G5); the "Welcome back" screen has no board for a quiz that was changed after the person started (their answers to removed pages are kept but not shown); and the maintenance page is used as is for `MAINTENANCE_MODE`. | Phase 12 to 14 |

### 13.2 Things the owner did not list but the product needs (all planned above)
- **Security:** RLS on every table with tests; service key only on the server; server-side re-validation of everything; `next` redirect after login accepts only same-site relative paths; user text is rendered as plain text (never HTML); the End page link must be `https://` and opens with `rel="noopener noreferrer"`; pictures only from our own storage; CSP and security headers; no secrets in the client bundle.
- **Abuse and spam:** rate limits (D11), Turnstile, response body size limits, quiz links used for phishing (Terms cover it; the admin can suspend; consider a "Report this quiz" link after launch).
- **Reliability:** answers are saved with an upsert per page so a double click or retry never duplicates; publish and save use versions so two tabs cannot silently overwrite each other; the 500th-response race is closed by an atomic database function.
- **Privacy:** only the quiz owner reads responses (admin cannot); account deletion removes rows and files; the Privacy page matches reality (cookieless analytics, error monitoring provider, email provider, Supabase and Vercel as processors); IP addresses are only stored as salted hashes for rate limits and are cleaned daily.
- **Data format future:** `format: "quiz-v1"` lets us add `quiz-v2` later. Keep one `migrateDocument()` function so old drafts and old AI answers can be upgraded.
- **Time zones and formats:** stored in UTC, shown in the viewer's zone in English formats.
- **Accessibility:** WCAG 2.1 AA as the target (contrast is already designed), keyboard use of the editor and quiz, labels on every input, error messages tied to fields (`aria-describedby`), dialogs trap focus and restore it, drag and drop has a keyboard alternative (the Move up/Move down menu), reduced motion.
- **Browser support:** current Chrome, Safari (iOS 15+), Firefox, Edge. The public quiz must also work on low-end Android phones.
- **Observability:** Sentry for errors, Supabase logs, Resend delivery logs, uptime check on `/api/health`. Logs must not contain answers or emails.
- **Costs to expect (check current prices):** Supabase paid plan for production, Vercel paid plan for commercial use, domain yearly, Resend free tier then paid by volume, Sentry/Cloudflare free tiers. The owner decides before Phase 16.
- **Owner support after launch:** the Contact inbox; an admin runbook (suspend, restore, change plan, raise a limit); a short "what to do if the site is down" note.

### 13.3 Database notes from Phase 3 (what was added or decided while building it)
- **Default limits** live in one SQL function, `private.plan_limits(profile_id)` (5 / 15 / 500; a `custom` plan with an empty limit falls back to these). The same numbers must exist in `src/lib/plan/limits.ts`; **a test must compare them** (not written yet, do it when that file exists). The reserved slug list and slug format exist in SQL (`slug_available`) and in `src/lib/slug.ts` too: same rule for a test.
- **Stricter than section 6.4, on purpose:** browser roles get column-level rights. A person can insert only `owner_id, name, slug, draft` on `quizzes` and update only `name, slug, accepting_responses, theme, hide_powered_by`. Without this a person could reset `finished_count` to 0 and get past the 500-response limit. Consequence for later phases: drafts go through `save_draft`, publishing through `publish_quiz`; anything else that must write other columns (for example "unpublish") needs a new RPC or the service role. `profiles`: update only `name`. `media` inserts must have a path inside the owner's folder.
- **Slug holds are enforced in the database** (trigger): a held slug cannot be taken by someone else (error 23505, message `slug_held`). Deleting a quiz or changing its slug creates a 30-day hold for the owner (D3 working default; owner has not confirmed).
- **RPC rights:** only `save_draft`, `publish_quiz`, `slug_available` are executable by logged-in people. `start_response`, `finish_response`, `track_open`, `rate_limit_hit` are service-role only. The `private` admin helpers (`admin_overview`, `admin_users_page`, `admin_user_detail`) are executable only by the service role, and the schema is not exposed through the API, so **Phase 11 must decide how server code calls them** (direct database connection, or thin `public` wrappers that stay service-role only).
- **Database commands without Docker:** use `--remote` (for example `supabase db push --remote`, `supabase db query --remote`); without it the CLI tries a local stack. `supabase gen types typescript --linked` still works. The shell breaks passwords with special characters, so run CLI commands through `node scripts/with-env.mjs <command>` (loads `.env.local` as written, never prints it).
- **Tests and checks** call the Supabase Management API for catalog queries (`SUPABASE_ACCESS_TOKEN` needs database read/write rights).
- Dev project note: the dashboard labels `main` as PRODUCTION; it is only the default branch name.

### 13.4 Built by Code without a design (2026-11-08): the owner's design to-do
The owner cannot give Code access to the Claude Design artifact from this account, so Code built the simplest sensible version of everything missing and keeps one honest list. **Where the list lives (keep all three in step):** `project_checklist.md` section H (owner-friendly table with where to see each), this section, and the dev page `/dev/undesigned` (`src/app/dev/undesigned/page.tsx`, links to each screen; does not exist in a production build).

Built **new** in this session (these were not in the app at all before): G1 conflict dialog, G5 email-change landing and expired wording, G6 disconnect Google, G7 "Near a limit" filter, G8 "Full" quiz card, G9 field errors on Register, Forgot and Reset, G10 phone menu when logged in, G11 sending and "couldn't send" states, G25 bot-check and rate-limit banners (and the contact form saying "not sent" when the bot check fails), G26 the address check that pauses quietly past 30 a minute. Built **earlier on a guess**, still no board: G2/G20, G3, G4/G17, G12, G13 to G16, G18, G19, G21, G22, G23, G24 and the "Welcome back" case of G25. Approved changes the boards do not show yet: D1, D2.

**How the new ones work (so a designer knows what exists):**
- **G1** `ConflictDialog` (cannot be dismissed): "This quiz was changed somewhere else", buttons "Load the newest" and "Keep my version".
- **G5** `/account?email=changed` toast "Your email address was changed"; `/verify-email/expired?for=email-change`, title "This link has expired", button "Go to my account".
- **G6** Account, Google row: "Disconnect" opens "Disconnect Google?" (buttons "Keep it connected" and "Disconnect Google"), toast "Google disconnected". Google-first accounts that set a password stay "Connected" (Supabase limit).
- **G7** Users filter "Near a limit", Overview counter links to it.
- **G8** Quiz card: grey pill "Full", description "It reached N responses. People see that it is closed.", no Copy link, no Open/Close menu item.
- **G9** `useValidatedForm` + `lib/validation.ts` (`registerProblems`, `forgotProblems`, `resetProblems`, 7 unit tests): red message under the field after pressing the button; Log in is unchanged (browser messages).
- **G10** `SiteNav` phone menu for a logged-in person: "Account settings" and "Log out" rows above the big button.
- **G11** `VerifyEmailView`: button spinner while sending; red banner "We couldn't send the email. Please try again in a minute."
- **G25** `?problem=check|wait|same-password` on the three forms, red banner (`AuthProblemBanner`).
- **G26** (new id) the live web-address check is limited to 30 a minute per person (D11); when refused the field just stops checking, with no message.

**Rule for later sessions:** when the owner designs one of these, build it to the board, delete its row from checklist H and this list, and add the board to Appendix A. Do not remove a row because the code "looks fine".

---

## 14. Quality control (QC)

### 14.1 Principles
1. **Test like a person.** QC scripts drive a real browser (Playwright) and use only what a person can use: type, click, drag, use the file chooser, press keys, read the screen. They do **not** call the database or internal functions to check results (except to *prepare* heavy data such as 500 responses, which is itself verified through the screen).
2. **Real services:** the built Next app runs on your computer against the cloud dev project. Emails land in a Mailtrap sandbox inbox and the scripts open the real links from them. QC only ever runs against the dev project and refuses to start if the Supabase URL is the production one.
3. **Both sizes:** dashboard flows run at desktop (1440×900); the public quiz and the website also run at phone size (390×844 with touch).
4. **Independent specs:** each spec creates its own people with unique emails (`qc-<random>@example.test`), so specs can run in parallel and in any order.
5. **Evidence:** screenshots at key steps (`qc/screenshots/`), trace and video on failure, readable step names ("Person B tries person A's quiz URL").
6. **No release with a red QC.** `npm run release-check` runs everything in 14.8.

### 14.2 Unit tests (Vitest) — pure logic, fast, in CI on every push
Must cover at least:
- `schema`: every page type accepts valid input and rejects each invalid field; limits on lengths and counts; document needs exactly one welcome first and one end last.
- `conditions`: each operator; All/Any; hidden source page; multi-select "is"; dependents of a page/answer; removing dependencies; "In plain words" sentences (golden strings).
- `diff`: added/changed/removed/unchanged; same id with different type; reorder only; answers added/removed; descriptions in plain words.
- `validate`: every blocking problem in 5.4; messages mention the right page number.
- `ai/import`: JSON with words around it; inside a code fence; two JSON objects (takes the first); smart quotes inside the prose; cut-off output; no JSON; wrong `format`; extra unknown fields ignored; `new-*` id mapping including references in rules; page-limit; picture left out; same id different type; **round trip** (export then import is "no changes") for every template and for a quiz using every page type.
- `ai/export`: prompt contains the right limit and every field of every type (generated from the registry); data-only copy is valid JSON.
- `slug`: accept/reject table (case, hyphens, length, reserved); `slugify`; collision suffix.
- `plan/limits`: defaults, overrides, nulls.
- `time-estimate`, `units` (range refill), `format` (relative times).
- `useQuizRunner` reducer: progress never decreases; Back skips hidden pages; changing an answer hides a later page and removes its answer on moving forward; required messages; auto-advance for single choice; range/email/phone checks; resume restores answers; preview does not call the save adapter.
- `summarize`: funnel math, where-people-leave with conditional pages, histogram buckets, date by month, text samples, removed questions, empty data.
- `export/csv|xlsx|json`: columns and order, removed-question columns, multi-select joining, quotes/commas/newlines, **formula injection**, BOM, filter handling.
- Server validators for public answers (the same functions the client uses): every page type, wrong option ids, out-of-range numbers, text too long.

### 14.3 Database tests (Vitest + `supabase-js` against the dev project; pgTAP optional in CI)
Method: each test creates two or three real test accounts with the Auth admin API, signs in as each one, and tries things with **their own sessions**, exactly as the app does; it cleans them up afterwards. The anon key is used for the "stranger" checks. The tests refuse to run unless the Supabase URL is the dev project.

- Anonymous users can read and write **nothing** in any table, and cannot list storage objects they do not own.
- Person A cannot select, update or delete anything of person B in `quizzes`, `responses`, `media`, `profiles`, `quiz_daily_stats` (try each table and each operation).
- A person cannot change their own `role`, `plan`, `status`, limits, flags, notes (`protect_profile_columns`); can change `name`.
- `enforce_quiz_limit` blocks the 6th quiz on Free and respects a raised limit.
- `save_draft`: wrong owner refused; stale `base_version` returns conflict; page limit enforced; oversize refused.
- `finish_response`: refuses at the limit; two concurrent finishes at 499 allow exactly one; unfinished responses do not count; deleting a response frees a slot.
- Slug: unique index case-insensitive; `slug_available` honors holds; deleting a quiz creates a hold.
- Cascades: deleting a profile removes quizzes, responses, media rows.
- Storage: only the owner can upload/delete inside their own folder; type and size limits.
- No policy allows an admin more than a normal person (admin helpers are not callable by `anon`/`authenticated`).

### 14.4 QC scripts (Playwright). Each ID is one spec file in `qc/specs/`
Run state: unless said, a fresh verified person created through the real register + mail-catcher link.

| ID | Spec (what the "person" does) | Pass when |
|---|---|---|
| QC-01 | **Website.** Open Home, Pricing, Contact, Terms, Privacy at desktop and phone; use the nav (including the phone menu) and every footer link; open a wrong URL; check logged-in nav after login | every page renders, no console errors, links land on the right page, 404 page shows, logged-in nav differs |
| QC-02 | **Register and verify.** Register (also with an invalid email, short password, existing email); open the verification email from the test inbox; click the link; land in the dashboard; try an old/used link; use "Send again" and watch the 60 s cooldown | account active only after the link, correct messages, no email-exists leak |
| QC-03 | **Log in and out, reset.** Wrong password (message), five wrong passwords ("Too many tries" for 15 min, also correct password refused), unverified login, logout, forgot password -> mail -> new password -> log in; expired reset link screen; password-changed email arrives | every state of 8.2 reachable and correct |
| QC-04 | **Create quizzes.** Blank, each template, copy of an existing quiz; names; the 6th quiz on Free shows the limit dialog; delete one and create again | pages per template match `TemplateContents`; limit dialog text exact |
| QC-05 | **Edit.** Rename; add every page type; fill every field of every type; add pictures; reorder by drag and with Move up/down; duplicate; delete with Undo; Start/End locked; reach 15 pages and see the limit dialog; refresh and check everything persisted; open in a second tab and trigger the conflict dialog | nothing lost on refresh, locks hold, limits right |
| QC-06 | **Conditions.** One rule, two rules with All and Any, "In plain words" text; delete a page and an answer that others depend on (warning, rules removed); try to move a page above its source (blocked); run the quiz and check which pages show for different answers | page visibility matches the rules in every case |
| QC-07 | **Pictures.** Upload JPG, PNG, WebP; a 6 MB file (error); a PDF/GIF (error); use a picture in a page and an answer; see it in the editor and in the public quiz; reopen the library | files upload through the real file chooser, errors exact |
| QC-08 | **Publish and share.** Try Publish with problems (list, "Go to page", fix each); publish; copy link; open the link in a fresh browser context (not logged in); edit without publishing (public unchanged); publish changes; close the quiz ("This quiz is closed"); reopen; never-published link ("This quiz isn't open yet") | public view always matches the published version |
| QC-09 | **Slugs and two people.** Person A sets a slug; person B tries the same (taken error, also with different case); invalid characters; reserved word; change slug (warning; old link is dead for strangers); both people save the same new slug at the same time | exactly one succeeds; no way to reach another person's quiz |
| QC-10 | **Take a quiz (phone size).** Complete a quiz with every page type; required errors; range/email/phone errors; Back; progress bar never shrinks; auto-advance; close the tab halfway and return ("Welcome back": Continue and Start over); finish and reopen ("You already finished"); simulate a failed save (block the network) and press Try again; Preview from the editor saves nothing | every rule of `BehaviorRules` observed |
| QC-11 | **Responses.** After QC-10 style data: Summary numbers; each card type; where people leave; Individual list, search, date range, include unfinished, pagination; delete one; delete all (type DELETE); download CSV, XLSX, JSON and open them (columns, removed-question column after editing the quiz, formula-injection text `=1+1` stays text) | numbers on screen equal the data; downloads correct |
| QC-12 | **Limits.** Seed 449 finished + 20 unfinished responses; banner at 450; reach 500 (banner "full", public sees closed); unfinished never counted; delete one and it opens again; Custom plan person with a raised limit continues | exact counts and texts |
| QC-13 | **Isolation.** Two people. B opens A's editor/responses/settings/preview URLs (not found), A's media URL listing, API calls with B's session against A's ids, API calls with no login; admin URLs as a normal person | nothing of A is ever visible or changeable by B or by a stranger |
| QC-14 | **Account.** Change name; change email (mail to the new address, "waiting" state, resend, cancel, confirm; old email works until then); change password (other session logged out, email arrives, wrong current password message); Google-only account sets a password (prepared account); delete account (type DELETE) and verify they cannot log in and their quiz link is gone | all flows of 8.9 |
| QC-15 | **Edit with AI.** Copy for AI and read the clipboard (prompt + JSON); edit the JSON with a script that simulates an AI (add pages, change text, add a condition, remove a page); paste; check screen counts and list; update; undo; broken answers: no quiz, cut-off, invalid page, too many pages, Start not first, picture unknown; edit the quiz after copying (warning); paste the unchanged export (no changes) | each result screen and message matches `AiHelperStates` |
| QC-16 | **Admin.** Normal person gets the no-access page; admin sees overview numbers equal to seeded data; users list search/filter/sort/pagination/CSV; open a person; switch plan to Custom and raise a limit (the person's limits change at once); suspend (person cannot log in, a logged-in session is stopped, public quizzes closed); restore (reopens); delete with typed email (everything gone); admin cannot suspend themself; log entries exist | all of 8.10 |
| QC-17 | **Emails.** Trigger each of the five emails; read each in the test inbox; click its link; check subject, sender, text and that the layout holds (screenshot) | all five correct |
| QC-18 | **Accessibility.** axe scan on every route and state reachable in the other specs (no serious/critical issues); keyboard-only run through register, create, edit a page, publish, take a quiz; focus visible; dialogs trap focus | zero serious issues; every flow completes with the keyboard |
| QC-19 | **Security.** Open-redirect attempts on `next`; XSS strings (`<script>`, `"><img onerror>`) in every text field show as text everywhere (editor, quiz, responses, exports, emails); oversize and malformed API bodies; rate limits trigger (login, contact, slug, public answers); secrets are not present in the client bundle or page source; security headers present | no script runs; limits trigger; no secret exposed |
| QC-20 | **Performance.** Lighthouse mobile on Home and on a public quiz; the public quiz JS stays under the budget (set in Phase 7, about 150 KB gzip); no editor/chart code in the quiz bundle | budgets met |
| QC-21 | **Production smoke** (read-mostly, run right after deploy): pre-created smoke account logs in; creates a quiz, publishes, opens the public link in a new context, answers on a phone-size viewport, sees the response, deletes the quiz; website pages load; `/api/health` ok | passes, then the smoke data is gone |

**Where the QC scripts live today (2026-11-08)** (all in `tests/qc/`, run with the npm scripts in `project_structure.md`): QC-01 `link-audit.spec.ts` + `prod-smoke.spec.ts`; QC-02, QC-03, QC-16 (access) `real-auth.spec.ts`; QC-04, QC-08 (publish), QC-10, QC-12, QC-13 `real-quiz.spec.ts`; QC-05, QC-06, QC-07, QC-08 (share), QC-09, QC-10 (phone), QC-11, QC-15 `real-editor.spec.ts`; QC-14, QC-16, QC-17 `real-account.spec.ts` (+ `tests/mail`); QC-18 `a11y.spec.ts`; QC-19, QC-20, QC-21 `prod-smoke.spec.ts`. Database rules and code-versus-database parity: `tests/db/`. The plan above says `qc/specs/`; the real folder is `tests/qc/`.

**Manual checks that cannot be scripted** (a checklist the owner and Code run before Phase 16): real Google login (new and existing account); real email delivery in Gmail and one more provider, on phone; the public quiz on a real iPhone and a real Android phone; a screen reader smoke test (VoiceOver or NVDA) of the quiz and the login; a final look at every board vs the screen.

### 14.5 Security checks (part of the gate)
- Search the production build output for the service-role key and for `SUPABASE_SERVICE_ROLE_KEY` (must not appear).
- Secret scanning in CI (for example gitleaks); `.env*` never committed.
- `npm audit` has no high/critical issues without a written reason.
- A script lists every table and fails if RLS is off.

### 14.6 Accessibility and performance targets
- Accessibility: QC-18 clean; contrast from the design tokens already passes 4.5:1; touch targets at least 44 px.
- Performance: Lighthouse mobile at least 90 for Home and the public quiz (performance and accessibility), quiz page first load under the JS budget, images through `next/image`, no layout jumps.

### 14.7 How QC runs
- `npm run qc:setup`: checks it points at the dev project (refuses production), applies migrations, clears QC data, builds the app with `.env.qc`, creates the admin account by SQL.
- `npm run qc` runs all specs (desktop and phone projects), `npm run qc -- qc/specs/qc-05-edit.spec.ts` runs one, `npm run qc:headed` shows the browser, `npm run qc:report` opens the report.
- Helpers in `qc/helpers/`: `registerAndVerifyViaUi()`, `mailbox.ts` (Mailtrap API), `seedResponses.ts`, `fakeAi.ts` (edits exported JSON like an AI would), `makePerson()` (unique emails), `network.ts` (offline/failure injection).
- The same specs run in CI on pull requests (headless). A nightly CI run repeats them against the staging deploy.

### 14.8 The release gate (`npm run release-check`)
In order, stop on the first failure: lint, typecheck, unit tests, database tests, RLS-on check, secret scan, `npm audit`, production build, bundle budget check, all QC specs (QC-01 to QC-20) against a cleaned dev project. Then, separately, QC against the staging deploy, then the manual checklist. Only then deploy to production, and run QC-21 right after.

### 14.9 Design fidelity
For each built screen, open it next to its board (desktop and phone). Differences in text, order, spacing, color, state or behavior are bugs. Playwright takes a screenshot of every route and state into `qc/screenshots/` so the comparison is quick. Any difference the owner prefers becomes a **design change first**.

---

## 15. GitHub, environments and deployment

### 15.1 GitHub
- Repo: https://github.com/ememdeee/quiz (**public**, created, `main` connected). Because it is public: no secrets or `.env*` ever (the CI secret scanner is mandatory), no customer data, and keep private business notes out of `plan/` (ask the owner before pushing `project_business.md` or `marketing_*.md` content that should stay private).
- Branches: `main` (always deployable to staging), `release` (what is live), feature branches `phase-N-name` / `feat/...`. Pull requests only into `main`; squash merge; short imperative titles; link the phase and the board names in the description.
- CI (GitHub Actions) on every PR: lint, typecheck, unit tests, build, database tests and QC specs headless against the dev project (secrets in GitHub Actions secrets; a pull request from a fork never gets them). Required to merge. Secret scanning on.
- Issues/Projects: one issue per phase task if the owner wants tracking on GitHub; otherwise the checklist in section 12 is enough.

### 15.2 Environments
| Environment | Code | Database | Email | URL |
|---|---|---|---|---|
| Dev + QC | your computer | Supabase project `quiz-dev` (cloud) | Mailtrap sandbox | localhost:3000 |
| Staging | `main`, Vercel project `quiz-staging` | the same project `quiz-dev` (a separate staging project only if it becomes necessary) | Mailtrap sandbox, later Resend to test inboxes | `*.vercel.app` or staging subdomain |
| Production | `release`, Vercel project `quiz-prod` | Supabase project `quiz-prod` (paid) | Resend (real) | the real domain |

### 15.3 Release steps (repeat for every release)
1. Everything merged in `main`, CI green, staging QC green, manual checklist done if the release touches those areas.
2. Back up production (Supabase backup / `pg_dump`). Apply migrations to production with `supabase db push` (forward-only; written to be safe before the new code is live). Push Auth config/templates with `supabase config push` if they changed.
3. Fast-forward `release` to `main`; Vercel deploys production.
4. Run QC-21 (production smoke). Check Sentry and the uptime check.
5. Tag `vX.Y.Z`. If something is wrong: **Vercel instant rollback** to the previous deployment; if a migration is the problem, fix forward with a new migration (never edit an old one).

### 15.4 Supabase and Vercel settings to remember
- Supabase Auth: Site URL = production domain; redirect URLs include staging, Vercel previews (wildcard) and local; email confirmations on; link lifetime per D1; email change double-confirm off; password minimum 8; Google provider on; CAPTCHA (Turnstile) on for sign-ups; custom SMTP = Resend.
- Supabase Storage: bucket `quiz-media` created by migration.
- Vercel: framework Next.js; functions region next to Supabase (D8); env vars per environment (never the production service key in Preview); `MAINTENANCE_MODE` available; production branch = `release`.
- DNS: site domain to Vercel; Resend records (SPF, DKIM, DMARC); nothing else public.

---

## 16. Glossary (plain language)
- **Supabase:** a hosted service that gives us the database (Postgres), login (Auth) and file storage (Storage) in one place.
- **RLS (Row Level Security):** rules inside the database that decide which rows each person may see or change, so a bug in our code cannot leak other people's data.
- **Migration:** a small file of database changes, run in order. The only way the database is changed.
- **Service role key:** a master key that bypasses RLS. Only the server may hold it.
- **Server action / route handler:** code that runs on the server when the browser asks (save, publish, answer).
- **Repository (repo) layer:** the one place that talks to the database, so the rest of the code does not care whether data is dummy or real.
- **Mock / dummy data:** fake data used while building the screens, before the backend exists.
- **Slug:** the last part of a quiz link (`/quiz/my-quiz`). Must be unique.
- **Draft / published:** the version you edit, and the frozen copy people see until you publish again.
- **Staging / production:** a safe copy of the real site for testing / the real site people use.
- **CI:** automatic checks that run every time code is pushed.
- **QC script:** an automatic test that clicks through the site like a person.
- **Mailtrap sandbox:** a fake inbox on the internet that catches emails during testing, so nothing real is sent.
- **DNS, SPF, DKIM:** domain settings that prove our emails really come from us, so they do not land in spam.
- **Cookieless analytics:** visitor counting that does not store anything in the visitor's browser, so no cookie banner is needed.

---

## Appendix A. Every board and where it is covered

Source: `project/canvas.json` of the artifact (version at the time of writing: 66, 158 boards). "Covered in" is the section of this file that tells how to build it. Phone copies (`...Mobile`) are built by the same responsive component as their desktop board.

| Board (file `project/<Board>.dc.html`) | Canvas page | Title in the design | Size | Covered in |
|---|---|---|---|---|
| `AddPage` | Dashboard | 3. Add a page | 1100×820 | 8.5 |
| `AddPicture` | Dashboard | Add a picture | 1100×640 | 8.5 |
| `Conditions` | Dashboard | 4. Display conditions | 1100×960 | 8.5 |
| `Empty` | Dashboard | 1b. Empty states and search | 1100×680 | 8.3 |
| `FEChoice` | Quiz (what people see) | Multiple choice | 390×844 | 8.7 |
| `FEChoiceError` | Quiz (what people see) | Multiple choice, with an error | 390×844 | 8.7 |
| `FEChoicePics` | Quiz (what people see) | Multiple choice, pictures, pick several | 390×844 | 5.2 |
| `FEClosed` | Quiz (what people see) | Quiz closed | 390×844 | 6.6 |
| `FEDate` | Quiz (what people see) | Date | 390×844 | 8.7 |
| `FEDateError` | Quiz (what people see) | Date, with an error | 390×844 | 8.7 |
| `FEDesktop` | Quiz (what people see) | On a computer: question page | 1280×800 | 8.7 |
| `FEDesktopStart` | Quiz (what people see) | On a computer: start page | 1280×800 | 8.7 |
| `FEEndButton` | Quiz (what people see) | End page: message + button | 390×844 | 8.7 |
| `FEEndOffer` | Quiz (what people see) | End page: result + offer | 390×844 | 8.7 |
| `FEEndThanks` | Quiz (what people see) | End page: message only | 390×844 | 8.7 |
| `FEInfo` | Quiz (what people see) | Info page | 390×844 | 8.7 |
| `FELoading` | Quiz (what people see) | Loading screen | 390×844 | 8.7 |
| `FENotFound` | Quiz (what people see) | Quiz not found | 390×844 | 6.6 |
| `FENumber` | Quiz (what people see) | Number | 390×844 | 8.7 |
| `FENumberError` | Quiz (what people see) | Number, with an error | 390×844 | 8.7 |
| `FEShell` | Quiz (what people see) | Building blocks | 1100×900 | 8.7 |
| `FEStart` | Quiz (what people see) | Start page | 390×844 | 8.7 |
| `FEText` | Quiz (what people see) | Text answer | 390×844 | 8.7 |
| `FETextError` | Quiz (what people see) | Text answer, with an error | 390×844 | 8.7 |
| `Main` | Dashboard | 2. Edit a quiz | 1440×1080 | 8.5 |
| `NewQuiz` | Dashboard | 1a. New quiz | 1100×760 | 8.4 |
| `PageMenu` | Dashboard | Page menu | 1000×700 | 8.5 |
| `Publish` | Dashboard | Publish: confirm | 1100×520 | 8.5 |
| `QuizMenu` | Dashboard | 1d. Quiz card menu | 700×420 | 8.3 |
| `Quizzes` | Dashboard | 1. Your quizzes (home) | 1280×930 | 8.3 |
| `Report` | Dashboard | 6a. Responses: Summary (scrolls) | 1440×1800 | 8.8 |
| `Responses` | Dashboard | 6b. Responses: Individual | 1440×960 | 8.8 |
| `Saving` | Dashboard | Saving and loading | 1100×520 | 8.3 |
| `Settings` | Dashboard | 5. Quiz settings | 1100×820 | 8.5 |
| `Share` | Dashboard | Publish: share the link | 1100×620 | 8.5 |
| `States` | Dashboard | Confirmations and errors | 1100×720 | 8.3 |
| `TypeEndButton` | Dashboard | Page type: End page, message + button | 1100×820 | 8.5 |
| `TypeEndThanks` | Dashboard | Page type: End page, message only | 1100×820 | 8.5 |
| `TypeInfo` | Dashboard | Page type: Info page | 1100×760 | 8.5 |
| `TypeLoading` | Dashboard | Page type: Loading screen | 1100×760 | 8.5 |
| `TypeNumber` | Dashboard | Page type: Number or date | 1100×760 | 8.5 |
| `TypePictures` | Dashboard | Page type: Multiple choice (pictures on) | 1100×760 | 5.2 |
| `TypeResult` | Dashboard | Page type: End page, result + offer | 1100×980 | 8.5 |
| `TypeText` | Dashboard | Page type: Text answer | 1100×760 | 8.5 |
| `TypeWelcome` | Dashboard | Page type: Start page | 1100×820 | 8.5 |
| `SiteLogo` | Shared components | Logo (shared) | 260×90 | 8.1 |
| `SiteNav` | Shared components | Navigation, computer | 1440×86 | 8.1 |
| `SiteNavMobile` | Shared components | Navigation, phone | 390×78 | 8.1 |
| `SiteNavMobileOpen` | Shared components | Navigation, phone menu open | 390×844 | 8.1 |
| `SiteFooter` | Shared components | Footer, computer | 1440×370 | 8.1 |
| `SiteFooterMobile` | Shared components | Footer, phone | 390×720 | 8.1 |
| `CtaBand` | Shared components | Call to action, computer | 1440×390 | 8.1 |
| `CtaBandMobile` | Shared components | Call to action, phone | 390×440 | 8.1 |
| `LogoA` | Branding | Logo | 1100×720 | 8.1 |
| `Home` | Website | Home | 1440×5240 | 8.1 |
| `WebPricing` | Website | Pricing | 1440×4190 | 8.1 |
| `Contact` | Website | Contact | 1440×1560 | 8.1 |
| `ContactSent` | Website | Contact: message sent | 1100×520 | 8.1 |
| `Register` | Website | Register | 1280×860 | 8.2 |
| `Login` | Website | Log in | 1280×860 | 8.2 |
| `Terms` | Website | Terms of Service | 1440×3400 | 8.1 |
| `Privacy` | Website | Privacy Policy | 1440×3650 | 8.1 |
| `NotFound` | Website | Page not found (404) | 1440×1100 | 8.1 |
| `LoginError` | Website | Log in: wrong password | 1280×860 | 8.2 |
| `LoginUnverified` | Website | Log in: email not verified | 1280×860 | 8.2 |
| `ForgotPassword` | Website | Forgot password | 1280×860 | 8.2 |
| `ForgotSent` | Website | Forgot password: check your email | 1280×860 | 8.2 |
| `ResetPassword` | Website | Set a new password | 1280×860 | 8.2 |
| `ResetDone` | Website | Password updated | 1280×860 | 8.2 |
| `VerifySent` | Website | Verify email: check your inbox | 1280×860 | 8.2 |
| `VerifyDone` | Website | Email verified | 1280×860 | 8.2 |
| `VerifyExpired` | Website | Verify email: link expired | 1280×860 | 8.2 |
| `HomeMobile` | Website | Home, phone | 390×8880 | R2. One place for everything (no repeated code) |
| `WebPricingMobile` | Website | Pricing, phone | 390×6020 | 8.1 |
| `ContactMobile` | Website | Contact, phone | 390×2420 | 8.1 |
| `RegisterMobile` | Website | Register, phone | 390×860 | 8.2 (same component as desktop) |
| `LoginMobile` | Website | Log in, phone | 390×860 | 8.2 (same component as desktop) |
| `LoginErrorMobile` | Website | Log in: wrong password, phone | 390×860 | 8.2 (same component as desktop) |
| `LoginUnverifiedMobile` | Website | Log in: not verified, phone | 390×860 | 8.2 (same component as desktop) |
| `ForgotPasswordMobile` | Website | Forgot password, phone | 390×860 | 8.2 (same component as desktop) |
| `ForgotSentMobile` | Website | Check your email, phone | 390×860 | 8.2 (same component as desktop) |
| `ResetPasswordMobile` | Website | New password, phone | 390×860 | 8.2 (same component as desktop) |
| `ResetDoneMobile` | Website | Password updated, phone | 390×860 | 8.2 (same component as desktop) |
| `VerifySentMobile` | Website | Verify email, phone | 390×860 | 8.2 (same component as desktop) |
| `VerifyDoneMobile` | Website | Email verified, phone | 390×860 | 8.2 (same component as desktop) |
| `VerifyExpiredMobile` | Website | Link expired, phone | 390×860 | 8.2 (same component as desktop) |
| `TermsMobile` | Website | Terms, phone | 390×4930 | 8.1 |
| `PrivacyMobile` | Website | Privacy, phone | 390×5460 | 8.1 |
| `NotFoundMobile` | Website | 404, phone | 390×1440 | 8.1 |
| `DashAccount` | Shared components | Account button (dashboard) | 64×64 | 8.1 |
| `Account` | Dashboard | 9. Account | 1280×1140 | 8.9 |
| `AccountMenu` | Dashboard | 9a. Account menu | 1280×560 | 8.3 |
| `AccountDelete` | Dashboard | 9b. Delete account | 1100×600 | 8.9 |
| `DashErrors` | Dashboard | Errors and warnings | 1100×1110 | 6.9 |
| `FEResume` | Quiz (what people see) | Welcome back, continue | 390×844 | 8.7 |
| `FEAlreadyDone` | Quiz (what people see) | Already finished | 390×844 | 8.7 |
| `FESaveError` | Quiz (what people see) | Could not save an answer | 390×844 | 8.7 |
| `BehaviorRules` | Quiz (what people see) | How the quiz behaves | 1100×5000 | 8.7 (and every rule: sections 1, 5.6, 6.8) |
| `BrandIcons` | Branding | Favicon and app icons | 1100×760 | 8.1 |
| `SocialHome` | Branding | Link preview: website | 1200×630 | 8.1 |
| `SocialQuiz` | Branding | Link preview: a quiz | 1200×630 | 8.1 |
| `UIFoundations` | Branding | UI kit: foundations | 1280×2060 | 3 and Phase 2.1 |
| `UIButtons` | Branding | UI kit: buttons and forms | 1280×1200 | 3 and Phase 2.1 |
| `UIFeedback` | Branding | UI kit: menus and messages | 1280×1090 | 3 and Phase 2.1 |
| `UINavigation` | Branding | UI kit: navigation and data | 1280×1140 | 3 and Phase 2.1 |
| `MainEmpty` | Dashboard | Edit a quiz: just created | 1440×900 | 8.5 |
| `EditorStates` | Dashboard | Editor header: publish states | 1440×640 | 8.5 |
| `ShareQuiz` | Dashboard | Share your quiz (any time) | 1100×620 | 8.5 |
| `TemplateContents` | Dashboard | What each template contains | 1100×720 | 5.2 |
| `DashPhone` | Dashboard | Dashboard on a phone | 390×844 | 8.3 |
| `AccountPassword` | Dashboard | 9c. Change password | 1100×700 | 8.9 |
| `AccountEmail` | Dashboard | 9d. Account: email change waiting | 1280×1160 | 8.9 |
| `LoginGoogleExists` | Website | Log in: Google, account exists | 1280×860 | 8.2 |
| `LoginGoogleCancelled` | Website | Log in: Google cancelled | 1280×860 | 8.2 |
| `AccountDeleted` | Website | Account deleted | 1280×860 | 8.2 |
| `ContactError` | Website | Contact: errors | 1440×1700 | 8.1 |
| `Error500` | Website | Something went wrong (500) | 1440×1100 | 8.1 |
| `Maintenance` | Website | Maintenance | 1440×1100 | 8.1 |
| `LoginGoogleExistsMobile` | Website | Log in: Google exists, phone | 390×860 | 8.2 (same component as desktop) |
| `LoginGoogleCancelledMobile` | Website | Log in: Google cancelled, phone | 390×860 | 8.2 (same component as desktop) |
| `AccountDeletedMobile` | Website | Account deleted, phone | 390×860 | 8.2 (same component as desktop) |
| `ContactErrorMobile` | Website | Contact: errors, phone | 390×2580 | 8.1 |
| `Error500Mobile` | Website | 500, phone | 390×1440 | 8.1 |
| `MaintenanceMobile` | Website | Maintenance, phone | 390×1440 | 8.1 |
| `SiteNavIn` | Shared components | Navigation, computer, logged in | 1440×86 | 8.1 |
| `SiteNavMobileIn` | Shared components | Navigation, phone, logged in | 390×78 | 8.1 |
| `FENotPublished` | Quiz (what people see) | Quiz not published yet | 390×844 | 6.6 |
| `FEError` | Quiz (what people see) | Something went wrong | 390×844 | 8.7 |
| `FEPreview` | Quiz (what people see) | Preview of a quiz | 390×844 | 8.7 |
| `EmailVerify` | Emails | Verify your email | 640×620 | 8.12 |
| `EmailReset` | Emails | Reset your password | 640×620 | 8.12 |
| `EmailPasswordChanged` | Emails | Password changed | 640×600 | 8.12 |
| `EmailContact` | Emails | New contact message (to you) | 640×600 | 8.12 |
| `LimitStates` | Dashboard | Free plan limits | 1100×620 | 8.3 |
| `AdminOverview` | Admin (only for you) | Admin: overview | 1440×1140 | 8.10 |
| `AdminUsers` | Admin (only for you) | Admin: users | 1440×950 | 8.10 |
| `AdminUser` | Admin (only for you) | Admin: one person | 1280×1700 | 8.10 |
| `AccountMenuAdmin` | Admin (only for you) | Account menu, for the admin | 1280×560 | 8.3 |
| `AdminNoAccess` | Admin (only for you) | Admin: no access | 1100×560 | 8.10 |
| `AiHelper` | Dashboard | Edit with AI | 1100×1210 | 8.11 |
| `AiHelperCheck` | Dashboard | Edit with AI: check the answer | 1100×960 | 8.11 |
| `AiHelperStates` | Dashboard | Edit with AI: problems and messages | 1100×1420 | 8.11 |
| `AiFormat` | Dashboard | Edit with AI: what gets copied | 1280×2740 | 8.11 |
| `TypeNumberKinds` | Dashboard | Page type: Number or date, each choice | 1100×1030 | 8.5 |
| `PublishProblems` | Dashboard | Publish: problems to fix | 1100×1125 | 8.5 |
| `ResponsesDelete` | Dashboard | Delete responses | 1100×740 | 8.8 |
| `AdminDialogs` | Admin (only for you) | Admin: confirm suspend and delete | 1100×800 | 8.10 |
| `EmailNewAddress` | Emails | Email: confirm your new email | 640×640 | 8.12 |
| `LoginTooMany` | Website | Log in, too many tries | 1280×860 | 8.2 |
| `LoginTooManyMobile` | Website | Log in, too many tries, phone | 390×860 | 8.2 (same component as desktop) |
| `VerifyResent` | Website | Verify your email, sent again | 1280×860 | 8.2 |
| `VerifyResentMobile` | Website | Verify your email, sent again, phone | 390×860 | 8.2 (same component as desktop) |
| `AccountGoogleOnly` | Dashboard | 9. Account, Google login | 1280×1190 | 8.9 |
| `LoginSuspended` | Website | Log in, account suspended | 1280×860 | 8.2 |
| `LoginSuspendedMobile` | Website | Log in, account suspended, phone | 390×860 | 8.2 (same component as desktop) |
| `ResetExpired` | Website | Reset link expired | 1280×860 | 8.2 |
| `ResetExpiredMobile` | Website | Reset link expired, phone | 390×860 | 8.2 (same component as desktop) |
| `ContactSentMobile` | Website | Message sent, phone | 390×520 | 8.1 |
