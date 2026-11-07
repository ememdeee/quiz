# Project Overview
> Last Updated: 2026-11-07 (added "Redesign in progress" and "New website and sign-in screens" sections; the rest of this file still describes the OLD svelteplus-based app)
> Maintained by: Claude (update this file whenever structure or major systems change)

---

## Redesign in progress (read this first)

The project is being redesigned into a simple Google-Forms replacement quiz platform for non-technical users. **Design comes first, no code yet.** Source of truth for the design: the Claude Design artifact https://claude.ai/artifact/FiiBUq7uJaBcXyeqfTKtTw (pages: Dashboard, Quiz, Website, Components, Branding, Emails, Admin). Only what is in that design gets built. The long "behavior" rules are in the artifact board "How the quiz behaves".

Everything below this section describes the old app (BodyReset, GTM/pixel tracking, timed/VSL pages, health calculations, Gumroad). Per the owner, all of that is **to be removed**, not kept: tracking (GTM, pixel), timed-slide and vsl pages, result calculations.

**Decisions made so far (summary)**
- English UI for now. Quiz pages: Start (first, exactly one), Multiple choice, Text (any/email/phone), Number or date (age, height cm/in, weight kg/lb, any number, date), Info, Loading, End (last, exactly one; 3 styles).
- Free plan limits: 5 quizzes, 15 pages per quiz, 500 finished responses per quiz. Custom plan is set by the admin per person (no payment flow, people contact us).
- Edit with AI: copy quiz as JSON (`quiz-v1`) plus a prompt, paste back, check, then update the draft (one Undo step).
- Admin area (owner only): sign-up overview, user list, switch Free/Custom, raise limits, suspend/delete with confirmation, action log.
- No cookie banner. Placeholder domain `yourshop.com`. Terms/Privacy are templates. Contact emails go to basurah@basrh.com.

**Language rule:** everything the owner types can be in any language. Built-in text (buttons like "Start the quiz" and "Continue", "Welcome back", all validation and error messages) is always English, has no setting, and is NOT part of the Edit with AI data.

**Not in the first version (decided, no design needed)**
- Embedding a quiz inside another website (the quiz is shared by link only).
- QR code for the quiz link.
- More than one person on an account (team members).
- Email to the owner each time someone finishes a quiz.
- Taking payments inside the app (the End page "offer" only links to the owner's own checkout).
- Different End pages for different answers (there is exactly one End page).
- File-upload questions, scores and calculated results.

**Reminders for build time (not design)**
- Spam protection for the Contact form and for quiz answers (limit how fast one person can send).
- Check uploaded pictures (type and size, 5 MB) before saving them.
- Choose a privacy-friendly visitor counter that needs no cookies (the Privacy page promises no cookie banner).
- Choose an error-monitoring service (the Privacy page lists "error monitoring" as a service provider).

**TODO before writing code (do these next, in order)**
1. Database design (users, quizzes, pages/draft vs published, responses with per-page answers, pictures, admin log, plan limits).
2. Pick the stack: database, login (email+password, Google, verify email, reset password, rate limit), email sending, image storage, hosting.
3. Build plan: data model, API routes, and the order of work (auth, then quiz editor, then respondent view, then responses/export, then Edit with AI, then admin).
4. Decide how an account is marked as admin (set directly in the database at first).
5. Remove the old features listed above from the existing code.

---

## New website and sign-in screens (built 2026-11-07, Phase 2.3 + 2.4)

The pages of the design tab "Website" are built, on mock data. They sit **next to** the old app, which is still in the repo until Phase 1 deletes it (the old `/dashboard`, `/quiz`, `/members`, `/editor`, steps, stores and libs below are untouched). Removed so far: the old home page (`src/app/page.tsx`, `src/components/home/**`), the old `/login`, and the GTM + Meta Pixel scripts in `src/app/layout.tsx` (tracking is being removed; the files `TrackingScripts.tsx`, `MetaPixelTracker.tsx`, `lib/gtm.ts`, `lib/tracking.ts` are now unused and go in Phase 1).

**Routes** (all URLs come from `src/lib/routes.ts`)

| Path | What | Where |
|---|---|---|
| `/` `/pricing` `/contact` `/terms` `/privacy` `/maintenance` | website pages | `src/app/(site)/` |
| not found, error | `not-found.tsx`, `error.tsx`, `global-error.tsx` | `src/app/` |
| `/register` `/login` `/forgot-password` (+ `/sent`) `/reset-password` (+ `/done`, `/expired`) `/verify-email` (+ `/done`, `/expired`) `/goodbye` | sign-in screens, one split layout | `src/app/(auth)/` |
| `/dev`, `/dev/session`, `/dev/500` | **dev only** (404 in production): list of every test link, switch who is logged in, preview the 500 screen | `src/app/dev/` |

Screens with several states open directly through a query: `/login?state=error|unverified|too-many|suspended|google-exists|google-cancelled`, `/contact?state=error|sent`, `/verify-email?state=resent`.

**Folders**
- `src/app/design-system.css` (imported by `globals.css`): design tokens in `@theme` (colors `ink slate mute ink-2 ctrl line line-strong soft dash page tint steel danger*`, the `nav` breakpoint = 900 px) and the motion layer (keyframes, `.enter`, `.scroll-rise`, `.stagger`, `.bg-dots`, `.blob`, `.orb`, `.lift` (smooth hover lift, no flicker), `.shine` (button light), `.ping`, `.count-up`, smooth anchor scroll). Everything stops under `prefers-reduced-motion`. Rules for hover and motion are in `project_handover.md` section 3 (Motion).
- `src/components/ui/`: `button` (Button, ButtonLink, DisabledButton, Spinner), `field` (Input, Textarea, Field), `banner`, `card` (Card, IconBadge, StepNumber), `chip` (ToggleChip), `rich-text` (`**bold**`, `[text](page:name)` links in content files), `link-styles` (`textLink` fading underline, `softHover`), `icons`.
- `src/components/layout/`: `logo`, `site-nav` (one client component: computer bar, phone bar + full-screen menu, logged-in variant), `account-menu`, `site-footer`, `cta-band`, `site-frame` (nav + page + footer, also used by error screens), `site-shell` (async: looks up the session).
- `src/components/marketing/`: page sections (`home/`, `pricing/`, `contact/`, `legal/`, `status/`) plus shared `container`, `section-heading`, `hero-backdrop`, `faq` (client component: full-width accordion with a slide transition).
- `src/components/auth/`: `auth-layout` (+ `AuthStack`, `AuthHeading`), `auth-panel` (right-hand dark panel, hidden below 900 px), forms.
- `src/content/`: all page copy (`home`, `pricing`, `contact`, `status`, `auth`, `site`) and `legal/` (terms, privacy generated from the design boards; inline format in `rich-text`).
- `src/lib/`: `routes.ts`, `utils.ts` (`cn`), `env.ts` (only `isProduction` so far), `validation.ts`.
- `src/server/`: `session.ts` (**mock** session cookie `mock_session` and the short-lived `pending_email` cookie), `actions/` (`auth`, `contact`, `session`: mock behavior, Phase 4/12 replace the insides).
- `src/data/mock/accounts.ts`: made-up test accounts (password `password123`): `demo@quiz.test`, `admin@quiz.test`, `unverified@`, `suspended@`, `locked@`.

**Known gaps and not-yet-done items** are in `project_handover.md` section 13.1 (G9 to G12) and section 12 (2.0b, 2.1, 2.2, 2.3, 2.4).

---

## Dashboard foundation and quiz list (Slice A, 2026-11-07, branch `phase-2-dashboard-ui`)
- Old app deleted (commit "Remove the old app"). Dashboard code: route group `src/app/(app)/` (layout checks the mock session; logged out goes to `/login`), `src/components/dashboard/*` (`dash-shell`, `phone-gate` below 900 px, `dash-events` for the logged-out and suspended dialogs, `quiz-list/*`, `quiz-placeholder` for `/dashboard/[quizId]` until the editor exists), words in `src/content/dashboard/*`, URLs in `routes.ts` (`quizHref.*`).
- Data: ports `src/server/repos/ports.ts` (async); mock in `src/server/repos/mock/*` runs in the browser with localStorage; wired in `src/server/repos/index.ts`; screens use only the hooks in `src/hooks/use-quizzes.ts`. Phase 5 replaces the inside of `repos` with server actions. Seed `src/data/mock/seed.ts`, templates `src/data/mock/templates.ts`. Test switches (slow, fail, offline, suspended, logged out, empty, full) are on `/dev` (`mock/flags.ts`, `mock/dev.ts`).
- Shared logic with tests (`npm test`, `vitest.config.ts`): `lib/plan/limits.ts`, `lib/slug.ts`, `lib/format.ts`, `lib/quizzes/list.ts`; error codes in `lib/errors.ts`.
- UI kit in `src/components/ui/` (Radix: dialog, dropdown-menu, popover, switch, checkbox, radio-group, tabs). `Button` and `Input` take `shape="box"` for the dashboard. `/dev/ui` shows all of it; `/dev/templates` shows the template contents.
- Decisions: card "Full" state not built (G8); Copy link copies directly (the Share dialog is slice C); tokens added: `fill`, `dashline`, `scrim`.

## What This Is

A **Next.js 15** quiz/assessment platform that sells a personalized health plan (BodyReset). Users complete a multi-step quiz, receive a result page with health insights calculated from their answers, and are presented with a $29 offer. The product name in-code is "quiz" (historical artifact — the project is not Svelte).

**Live product:** quiz.com
**Offer:** BodyReset Plan — $29 one-time via Gumroad

---

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.5.9 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| State management | Zustand | 5.0.8 |
| State immutability | Immer | 11.x |
| Icons | Lucide React | 0.544 |
| Drag & drop (editor) | dnd-kit | 6.x / 10.x |
| Charts | Recharts | 3.x |
| 3D (unused/minor) | React Three Fiber + Drei | 9.x / 10.x |
| Validation | Zod | 4.x |
| Runtime | Node.js / Vercel |  |

---

## Directory Structure

```
quiz/
├── public/
│   ├── data/quizzes/          # Quiz JSON files (quiz configs + index)
│   │   ├── index.json         # List of all quizzes (id, title, status)
│   │   └── [quizId].json      # Full QuizConfig for each quiz
│   ├── images/body-reset/     # Home page photos (hero, phase-01..04, cta) — Pexels, sources/licence in IMAGE-SOURCES.md
│   ├── images/reviews/        # Review avatars — AI-generated (Canva), NOT real customers; see IMAGE-SOURCES.md
│   ├── simple-daily-step/     # Old home phase images — no longer referenced by code (kept until removal is confirmed)
│   └── mascot/                # Maya mascot images for result page
│
├── src/
│   ├── app/                   # Next.js App Router routes
│   │   ├── layout.tsx         # Root layout — GTM + Meta Pixel init
│   │   ├── page.tsx           # Home (/) — SERVER component (force-dynamic): resolves quiz URL via getQuizUrl(), composes components/home/*. /home-new 308-redirects here (next.config.ts)
│   │   ├── robots.ts          # /robots.txt — User-Agent: * / Disallow: / (portfolio site, no crawling)
│   │   ├── quiz/[quizId]/     # Public quiz-taker route (/quiz/:id)
│   │   │   ├── page.tsx       # SERVER component — reads quiz JSON + index status from disk (force-dynamic), preloads hero image
│   │   │   ├── QuizPageClient.tsx # Client shell — useQuizFlow + <QuizContent> (was the old page.tsx)
│   │   │   └── layout.tsx     # generateMetadata + server-side theme CSS vars from quiz JSON
│   │   ├── dashboard/         # Protected admin area
│   │   │   ├── page.tsx       # Quiz list
│   │   │   ├── [quizId]/      # Quiz editor for a specific quiz
│   │   │   └── settings/      # Project-wide settings
│   │   ├── members/           # Course/members area (post-purchase)
│   │   │   └── course/[slug]/ # Individual course page
│   │   ├── login/             # Auth page
│   │   └── api/               # API routes
│   │       ├── quiz/          # GET/POST quiz JSON files
│   │       ├── settings/      # Save project settings
│   │       └── redirections/  # Manage short-link redirects
│   │
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── QuizContent.tsx      # Main quiz renderer (reads from useQuizFlow)
│   │   │   ├── steps/               # Shared step building blocks (StepHeader, StepImage, BigNumberInput, RangeHint, GenericStep)
│   │   │   └── TestimonialSlider.tsx
│   │   ├── landing/                 # OLD three.js landing sections — unused since 2026-10-11 (kept until removal is confirmed)
│   │   ├── home/                    # Home page (/) — no three.js; motion is CSS + small client islands
│   │   │   ├── content.ts           # ALL home copy/data (nav links, phases, pain points, FAQs, reviews, socials) — edit wording here. PHASES[].focus = object-position per phase image
│   │   │   ├── home.css             # Keyframes/effects, scoped to .hn-root (imported only by the home page)
│   │   │   ├── MotionDirector.tsx   # One IntersectionObserver for [data-reveal] → sets data-in; pauses [data-loop] sections off-screen; --hn-vel scroll velocity
│   │   │   ├── SiteNavbar.tsx       # Floating pill nav: scrollspy lime indicator, scroll progress, circular-reveal menu (hamburger below lg / 1024px). Takes quizUrl prop
│   │   │   ├── SiteFooter.tsx       # Footer with socials (project_business.md URLs), giant hover wordmark. Takes quizUrl prop
│   │   │   ├── MagneticButton.tsx   # Shared CTA pill (next/link, cursor magnet, shine, arrow swap)
│   │   │   ├── PointerField.tsx     # Exposes pointer position as CSS vars (--mx/--my/--cx/--cy) for parallax + cursor glow
│   │   │   ├── fonts.ts             # Instrument Serif italic accent font (--font-hn-serif)
│   │   │   └── Hero, MarqueeBands, PainPicker, HowItWorks, Benefits (+WayToggle, TiltCard), StatsBand (+CountUp), Reviews, Faq, FinalCta, StrikeRotator
│   │   ├── ui/                      # Reusable UI primitives (theme-agnostic, colored via currentColor)
│   │   │   └── message-loading.tsx  # Bouncing-dots loader (CSS keyframes, animates from first paint) — used on quiz page loading state
│   │   └── SettingsHydrator.tsx     # Hydrates project settings from API on load
│   │
│   ├── steps/                 # Step type definitions — one folder per type
│   │   ├── registry.ts        # MASTER REGISTRY — imports all step types
│   │   ├── quiz-landing/      # Full-screen hero landing page (auto-advances)
│   │   ├── multiple-choice/   # Radio options (auto-advances)
│   │   ├── checkbox/          # Multi-select checkboxes
│   │   ├── image-options/     # Select from image grid (auto-advances)
│   │   ├── form-weight/       # Two-phase weight input (current → target)
│   │   ├── form-height/       # Height with unit toggle (cm/ft)
│   │   ├── form-age/          # Age number input
│   │   ├── form-input/        # Generic text/email/number input
│   │   ├── form-target-date/  # Date picker for goal target
│   │   ├── loading/           # Auto-advancing loading screen
│   │   ├── timed-slide/       # Auto-advancing message slide
│   │   ├── info-page/         # Static informational screen (markdown body code-split into InfoMarkdown.tsx, preloaded post-hydration by QuizPageClient)
│   │   ├── weight-summary/    # Calculated weight insight card (recharts chart code-split into WeightChart.tsx, preloaded at idle)
│   │   ├── summary/           # BMI + metrics summary
│   │   ├── vsl-page/          # Video sales letter with delayed CTA
│   │   ├── confirmation/      # Thank you / confirmation screen
│   │   └── result-page-01/    # Main result + offer page (conversion step)
│   │
│   ├── hooks/
│   │   ├── useQuizFlow.ts     # CORE HOOK — all quiz runtime orchestration
│   │   ├── useQuizUrl.ts      # URL param helpers
│   │   └── useInView.ts       # Intersection observer util
│   │
│   ├── store/                 # Zustand stores (client state)
│   │   ├── answerStore.ts     # Current step index, all answers, session timing
│   │   ├── userProfileStore.ts# User biometrics + lifestyle (persisted to localStorage)
│   │   ├── authStore.ts       # Auth state
│   │   ├── quizBuilderStore.ts# Editor / builder state
│   │   └── redirectionsStore.ts
│   │
│   ├── lib/                   # Pure utility modules
│   │   ├── gtm.ts             # GTM: pushEvent() helper
│   │   ├── tracking.ts        # Meta Pixel: track.quizStart/viewOffer/initiateCheckout
│   │   ├── healthCalculations.ts # BMI, metabolic age, body fat, weight projection
│   │   ├── units.ts           # kg/lbs + cm/ft-in conversions (kgToLbs, lbsToKg, ftInToCm, cmToFtIn) — the single source for LBS_PER_KG / CM_PER_INCH
│   │   ├── visibility.ts      # Conditional step logic (show/hide by prior answers)
│   │   ├── conditionHelpers.ts # Shared comparison primitives (isEmptyValue, matchesEquals, matchesContains) — used by visibility.ts and branching.ts
│   │   ├── branching.ts       # Conditional branches: evaluates Step.branches, resolves content/type overrides at runtime
│   │   ├── metadata.ts        # buildMetadata() for Next.js generateMetadata — always sets robots noindex/nofollow (portfolio site)
│   │   ├── quizData.server.ts # Server-only quiz JSON + index-status disk reads (React cache(), one read per request)
│   │   ├── lazyWarm.tsx       # createWarmLazy(): code-split loadable that renders synchronously once preloaded (used for the recharts chart + info-page markdown; next/dynamic's Suspense reveal throttle made warmed chunks pop in ~285ms late)
│   │   └── projectSettings.ts # Server-only: getProjectSettings() + getQuizUrl() (Home Page Quiz → /quiz/{id}, else /quiz; server counterpart of hooks/useQuizUrl)
│   │
│   ├── types/
│   │   ├── quiz.ts            # All quiz TypeScript types (QuizConfig, Step, etc.)
│   │   └── stepSchema.ts      # SchemaField type for declarative editor forms
│   │
│   ├── contexts/
│   │   └── ToastContext.tsx   # Global toast notifications
│   └── middleware.ts          # Redirect rules from /data/redirections.json (30s memo, stale-while-revalidate — serves memoized rules, refreshes in background; only the first request per instance blocks) + token gate for /members, /course
│
└── plan/
    ├── project_structure.md   # ← this file
    ├── project_tracking.md    # Analytics tracking plan (Meta Pixel + GTM)
    ├── project_business.md    # Business/brand master reference
    ├── marketing_content.md   # Marketing copy (excluded from auto-read)
    └── marketing_meta.md      # Facebook ads setup reference (excluded from auto-read)
```

---

## Core Systems

### 1. Quiz Flow (`src/hooks/useQuizFlow.ts`)

The single hook that powers the entire quiz-taker experience. Every quiz interaction passes through here.

**Responsibilities:**
- Consumes quiz data resolved **server-side** by `page.tsx` (`ServerQuizData` argument; disk read via `src/lib/quizData.server.ts`). Published quizzes initialize state immediately, so step 1 is in the SSR HTML and no loading spinner shows. Draft gating (index status + `meta.status` + `isAuthenticated` + `?preview=true`) still runs client-side with identical rules. The old two-fetch path (`index.json` → `[quizId].json`) remains as fallback for callers without server data
- Manages current step index via `answerStore`
- Handles forward/back navigation with **visibility-aware** logic (skips hidden steps)
- Fires GTM events: `quiz_started`, `quiz_step_view`, `quiz_answer_selected`, `quiz_completed`
- Fires Meta Pixel: `Lead` (on quiz-landing answer)
- Handles auto-advance for step types that don't need a Continue button
- Manages the two-phase weight input (current weight → target weight)
- Returns all state + handlers to `<QuizContent>`

### 2. Step Registry (`src/steps/registry.ts`)

Single source of truth for all step types. Each step type is a folder in `src/steps/` with:
- `YourStep.tsx` — the quiz-taker renderer
- `index.ts` — `StepDefinition` object (`satisfies StepDefinition`) containing:
  - `type` — kebab-case key (e.g. `'quiz-landing'`)
  - `component` — the renderer
  - `schema` or `editor` — how the step appears in the builder
  - `defaultContent` — starting values when a new step is created
  - `showNavigation`, `showCTA`, `requiresValidation` — behavioral flags
  - `validate()` — answer validation function
  - `syncToProfile()` — maps answer to `userProfileStore` fields

`StepType` (the union of all type strings) is **auto-derived** from the registry — no separate union to maintain.

### 3. Conditional Visibility (`src/lib/visibility.ts`)

Steps can be conditionally shown/hidden based on prior answers. Rules support:
- Operators: `equals`, `not_equals`, `contains`, `is_empty`, `is_not_empty`
- Match strategy: `all` (AND) or `any` (OR)
- Only backward references allowed (no circular dependencies)

When an answer changes and hides a downstream step the user already answered, those **orphaned answers are cleared** automatically.

### 3b. Conditional Branches (`src/lib/branching.ts`)

Distinct from Visibility above: branches never hide/skip a step — they only override a step's **content** (and optionally its `type`) when matched. Step sequence and `Step.id` never change, so `step_index`/`step_id`-based tracking (GTM, GA4 funnel) is unaffected.

- `Step.branches?: StepBranch[]` — evaluated top-to-bottom at runtime; the **first** branch whose `conditions` match wins. No match = the step's own base content renders.
- Each `StepBranch` has: `id`, optional `label`, `conditions: ConditionGroup` (`match: 'all'|'any'` + `rules: ConditionRule[]`), optional `type` override, and a full `content: StepContent` clone (independently editable from the base step).
- `ConditionRule.source` is `'answer'` (references a preceding step's answer by `stepId`) or `'queryParam'` (reads a URL query param by `param`, e.g. `utm_content`).
- Operators: `equals`, `not_equals`, `greater_than`, `less_than` (numeric), `contains`, `is_empty`, `is_not_empty`. An empty rule set never matches — branches must opt in (unlike Visibility's "no rules = always pass").
- Resolution happens once, in `useQuizFlow.ts` (`resolveEffectiveStep(rawStep, getAllAnswers(), searchParams)`), producing the `currentStep` passed to `QuizContent` — no changes needed in `QuizContent.tsx` or step renderers.
- Editor: three-dot menu on each step row in `StepNavigator.tsx` → "Add Conditional Branch" (`alt_route` icon) → `quizBuilderStore.addBranch()` clones the step's content into a new branch, shown as an indented, amber-accented row nested under its parent. `PropertyEditor.tsx` switches to a branch-editing mode (condition rule builder via `ConditionEditor.tsx` + the same content editor used for steps) when a branch row is selected. `LivePreview.tsx` renders the branch's content/type as-if-matched while it's selected.
- Shares comparison logic with Visibility via `src/lib/conditionHelpers.ts` (`isEmptyValue`, `matchesEquals`, `matchesContains`) rather than duplicating it.

### 4. State Management (Zustand)

| Store | Persisted | Contents |
|---|---|---|
| `answerStore` | No (session only) | Current step index, all answers + timestamps, session start/end |
| `userProfileStore` | Yes (localStorage) | Gender, age, height, weight, target weight, lifestyle answers |
| `authStore` | Yes (localStorage, key `auth-storage`) | `isAuthenticated` flag |
| `quizBuilderStore` | No | Editor draft state (`selectedStepId`, `selectedBranchId`, step + branch CRUD) |

### 5. Quiz Data Format

Quizzes are stored as static JSON files in `/public/data/quizzes/`. No database.

**`index.json`** — array of `QuizListItem` (used by dashboard list and draft/published gating):
```json
[{ "quizId": "body-reset", "title": "Body Reset Quiz", "status": "published", ... }]
```

**`[quizId].json`** — full `QuizConfig`:
```typescript
{
  quizId: string,
  meta: { title, description, theme?: QuizTheme, status },
  settings: { showProgressBar, allowBack, autoAdvance },
  steps: Step[]   // ordered array — index = step position
}
```

Each `Step`:
```typescript
{
  id: string,             // e.g. "q-gender", "q-weight"
  type: StepType,         // must match a registered step type
  layout: LayoutType,
  required: boolean,
  content: StepContent,   // type-specific fields
  navigation?: NavigationConfig,
  visibility?: VisibilityRules,
  branches?: StepBranch[] // conditional content variants — see "Conditional Branches" below
}
```

### 6. Analytics & Tracking

Two parallel tracking systems. Never mix them.

| System | File | Purpose |
|---|---|---|
| Meta Pixel | `src/lib/tracking.ts` | Ad optimization signals only (Lead, ViewContent, InitiateCheckout) |
| GTM | `src/lib/gtm.ts` | All other events — funnel analysis via GA4 |

See `plan/project_tracking.md` for full event list and verification checklist.

### 7. Health Calculations (`src/lib/healthCalculations.ts`)

Runs on the result page using data from `userProfileStore`. Computes:
- BMI
- Metabolic age
- Body fat % (Deurenberg formula)
- Weight projection curve to target

The result page (`result-page-01`) uses these to render personalized before/after metrics.

### 8. Quiz Theming (`src/types/quiz.ts`)

Each quiz can have its own color palette configured via 6 tokens stored in `meta.theme` (`QuizTheme` type). Defaults are in `DEFAULT_QUIZ_THEME`.

**Tokens:**

| Token | Controls | Default |
|-------|----------|---------|
| `primary` | Buttons, progress bar, selected accents, chart lines | `#13ecc8` |
| `primaryForeground` | Text/icon on primary backgrounds | `#10221f` |
| `background` | Page background | `#f6f8f8` |
| `foreground` | Headings & body text | `#0f172a` |
| `mutedForeground` | Secondary/helper text | `#64748b` |
| `border` | Card borders, dividers | `#e2e8f0` |

**How it works:**
1. `quiz/[quizId]/layout.tsx` reads the quiz JSON **server-side** and sets the CSS custom properties (`--quiz-primary`, etc.) on a `display: contents` wrapper — so pre-hydration UI (the page loading screen) is already themed. `QuizContent.tsx` sets the same vars again client-side from `quiz.meta.theme ?? DEFAULT_QUIZ_THEME` (this is what the editor preview relies on)
2. `globals.css` `@theme inline` registers `--color-quiz-*` tokens that map to these CSS variables
3. Step components use Tailwind classes: `bg-quiz-primary`, `text-quiz-fg`, `border-quiz-border/30`, etc.
4. For inline styles (Recharts, SVGs), use `var(--quiz-primary)` directly

**Preset palettes** (6 total, editable in Quiz Settings):
- Mint (default): `#13ecc8, #10221f, #f6f8f8, #0f172a, #64748b, #e2e8f0`
- Coral: `#f97066, #fff, #fef7f4, #1a1a2e, #6b7280, #fde8e4`
- Indigo: `#6467f2, #fff, #f5f5ff, #1a1a2e, #6b7280, #e0e0f0`
- Gold: `#f5a623, #1a1a2e, #fffdf5, #1a1a2e, #6b7280, #e8dcc8`
- Warm Sand: `#B45A3C, #fff, #fbf6f0, #2a2420, #8c8076, #ece0d2`
- Forest: `#0F4D3A, #fff, #DFF3EC, #0F4D3A, #3E8F7A, #b8d9cf` — matches home page (Deep Emerald + Soft Mint)

**Rule:** New step components must use `quiz-*` Tailwind classes — never hardcode hex colors for theme-sensitive elements.

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page (redesign, components/home/*) |
| `/home-new` | Redirect | 308 → `/` (old review URL of the redesign) |
| `/robots.txt` | Public | Disallow all crawlers |

**Indexing (since 2026-10-11):** the whole site is kept out of search engines — `robots.txt` disallows everything, every page gets `noindex, nofollow` robots meta via `buildMetadata()`, and `next.config.ts` adds `X-Robots-Tag: noindex, nofollow, noarchive, noimageindex` to every response. Remove all three to re-enable indexing.
| `/quiz/[quizId]` | Public | Quiz taker (draft quizzes blocked unless authenticated or `?preview=true`) |
| `/dashboard` | Protected | Quiz list |
| `/dashboard/[quizId]` | Protected | Quiz builder / editor |
| `/dashboard/settings` | Protected | Project settings (title, favicon, etc.) |
| `/members` | Post-purchase | Course area |
| `/members/course/[slug]` | Post-purchase | Individual course |
| `/login` | Public | Auth |

---

## Adding a New Mascot Variant

Mascots are theme-colored SVG characters used as selectable options inside `image-options` steps. The clothing color automatically matches the quiz's primary color.

### Trigger: `vector-*.html` filenames

**Whenever the user provides a file named `vector-*.html` in `public/mascot/`, treat it as a new mascot variant and run the three steps below immediately — no extra instruction needed.**

The `vector-` prefix is the signal. Example: `vector-maya-all-ages.html` → variant ID `vector-maya-all-ages`.

### What you need to provide

Drop an HTML file into `public/mascot/`. The filename (without `.html`) becomes the variant ID.

**Required SVG structure inside the file** (the current generator already produces this):
```html
<svg viewBox="0 0 500 500">
  <image href="data:image/png;base64,..."/>   ← full body
  <mask id="shirtMask">
    <image href="data:image/png;base64,..."/> ← grayscale shirt-area mask
  </mask>
  <rect mask="url(#shirtMask)" style="mix-blend-mode:multiply"/>
</svg>
```

### Steps to wire it up (Claude does all of this)

Given a file like `public/mascot/vector-maya-all-ages.html`:

1. **Inspect the JS** — check if it contains a single SVG or a multi-variant `AV` JS object with keys per age/type (e.g. `"18_24"`, `"25_34"`). Both cases are handled.

2. **Extract PNGs** — for each variant found, save:
   - `public/mascot/[variant-id]-body.png`
   - `public/mascot/[variant-id]-shirt-mask.png`

   **Since 2026-07-11 (Phase 1 asset optimization):** the runtime loads `[variant-id]-body.webp` (372×372, cwebp `-q 82 -m 6 -sharp_yuv`) and `[variant-id]-shirt-mask.png` (372×372). After extracting new 500px PNGs, downscale body+mask by the same factor and encode the body to WebP; `MascotSVG.tsx` requests `-body.webp`. Sizing basis: 2× the largest rendered CSS size (185px on the result page).
   
   Multi-variant example (`vector-maya-all-ages.html` had 4 variants):
   - `vector-maya-18-24-body.png` + `vector-maya-18-24-shirt-mask.png`
   - `vector-maya-25-34-body.png` + `vector-maya-25-34-shirt-mask.png`
   - `vector-maya-35-44-body.png` + `vector-maya-35-44-shirt-mask.png`
   - `vector-maya-45plus-body.png` + `vector-maya-45plus-shirt-mask.png`

3. **Register** — add one line per variant to `src/steps/image-options/mascotRegistry.ts`.

4. **Done** — variants instantly appear in the "Visual Type" dropdown in the editor.

### Current variants

| Variant ID | Source file | Label |
|---|---|---|
| `vector-maya-18-24`           | `maya-all-options.html` | Maya · Age 18–24   |
| `vector-maya-25-34`           | `maya-all-options.html` | Maya · Age 25–34   |
| `vector-maya-35-44`           | `maya-all-options.html` | Maya · Age 35–44   |
| `vector-maya-45plus`          | `maya-all-options.html` | Maya · Age 45+     |
| `vector-maya-body-slim`       | `maya-all-options.html` | Maya · Slim        |
| `vector-maya-body-thin`       | `maya-all-options.html` | Maya · Thin        |
| `vector-maya-body-fit`        | `maya-all-options.html` | Maya · Fit         |
| `vector-maya-body-average`    | `maya-all-options.html` | Maya · Average     |
| `vector-maya-body-hourglass`  | `maya-all-options.html` | Maya · Hourglass   |
| `vector-maya-body-mid-sized`  | `maya-all-options.html` | Maya · Mid-sized   |
| `vector-maya-body-curvy`      | `maya-all-options.html` | Maya · Curvy       |
| `vector-maya-body-plus-sized` | `maya-all-options.html` | Maya · Plus-sized  |

All extracted assets live in `public/mascot/vector/`. The canonical source file is `maya-all-options.html` — **removed from `public/` on 2026-07-11 to keep 6 MB out of the deployment; retrieve it from git history (`git show b292ad9^:public/mascot/vector/maya-all-options.html`) when re-extraction is needed**, or drop a fresh copy into `public/mascot/vector/` and re-run extraction for all 12 keys.

### Key files

| File | Purpose |
|---|---|
| `src/steps/image-options/mascotRegistry.ts` | Registry of all mascot variants — add new entries here |
| `src/steps/image-options/MascotSVG.tsx` | Generic SVG renderer — reads `/mascot/[id]-body.png` + `/mascot/[id]-shirt-mask.png` |
| `src/steps/image-options/ImageOptionsStep.tsx` | Renders `MascotSVG` when `option.mascot` is set |
| `public/mascot/vector/` | Drop new `vector-*.html` files here; extracted PNGs live here too |

---

## Adding a New Step Type

1. Create `src/steps/your-step-name/YourStep.tsx` — the renderer component
2. Create `src/steps/your-step-name/index.ts` — the `StepDefinition` with `satisfies StepDefinition`
3. Import and add to `ALL_STEPS` array in `src/steps/registry.ts`
4. `StepType` union updates automatically — no other type changes needed

---

## How to Keep This File Updated

Update this file whenever you make structural changes. Specifically:

| Change | What to update |
|---|---|
| New step type added | Steps section in directory tree, step registry list |
| New route added | Routes table |
| New lib utility added | `src/lib/` section in directory tree |
| New Zustand store added | State management table |
| Quiz data format changed | Quiz Data Format section |
| Tracking changes | Update `plan/project_tracking.md` instead (this file just references it) |
| Theme tokens or presets changed | Quiz Theming section |
| New top-level feature area | Add to Core Systems |

Update the `Last Updated` date at the top when editing.
