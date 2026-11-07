# Tracking Plan
> Last Updated: 2026-11-08
> The old product's tracking (Meta Pixel `861394259546340`, GTM `GTM-PG86C8VF`, GA4 `G-PNE2DC64TS`, the quiz funnel events) was removed from the code on 2026-11-07 and this file no longer describes it. Those accounts still exist; they belong to the old BodyReset offer and are not used by the new product.

## What the new product tracks

There are **no advertising pixels, no tag manager and no cookies for tracking**. The product says so to people (Privacy Policy, "no cookie banner").

| What | Where it is kept | How |
|---|---|---|
| People who **opened** a quiz | `quiz_daily_stats` (one row per quiz and day) | `POST /api/q/[slug]/open` calls the database function `track_open`. The browser asks once for each tab session. Shown on the Summary as "Opened" |
| People who **started** a quiz | `responses` (one row per person) | created when someone presses "Start the quiz" (`start_response`) |
| People who **finished** | `responses.status = finished` and `quizzes.finished_count` | the End page was reached and the server accepted all answers (`finish_response`, atomic against the 500 limit) |
| Where people **leave** | `responses.pages_seen` and `last_page_id` | the Summary shows the drop per page and "Left at page N" |
| Sign-ups, quizzes made, responses collected | counted from the database | the admin Overview |
| Contact messages | `contact_messages` | a copy of every message, even if the email fails |
| Admin actions | `admin_log` | every plan change, suspend, restore and delete, with who did it and when |
| Sign-in tries | `login_attempts` | for the 5-tries lock; cleaned daily. Only a salted hash of the address is kept |

The counts are the owner's own data and the product's own admin numbers. Nothing is sent to a third party.

## Website visitors (decision D6, still open)

Counting visitors of the marketing site (not quiz takers) needs a cookieless tool. Recommendation: **Vercel Web Analytics** (no cookies, one component). It is switched on in code only when the site runs on Vercel (`@vercel/analytics`), so nothing is sent from a local or test run. If the owner prefers Plausible, only that one component changes.

## Errors (Phase 14, needs the owner's account)

Error monitoring with Sentry is wired to switch on when `SENTRY_DSN` is set. Logs must never contain answers or email addresses.

## Rules

- No Meta Pixel, GTM or GA4 in the new product unless the owner decides so in writing. If ads return, tracking goes through one file and its own plan section, and the Privacy Policy and the cookie rules (there is none today) change first.
- Never send what a person answered to any third party.
- IP addresses are only ever stored as salted hashes, for rate limits and the sign-in lock, and are cleaned daily.
