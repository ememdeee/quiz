# Tracking Plan
> Last Updated: 2026-11-07
> Maintained by: Claude (update this file as setup progresses)

> **2026-11-07: the GTM and Meta Pixel scripts were removed from `src/app/layout.tsx`.** The redesigned product has no tracking (owner decision, see `project_structure.md`), and the new website would otherwise have sent the old product's page views. Everything below describes the old setup and is deleted in Phase 1; the unused files are `components/TrackingScripts.tsx`, `components/MetaPixelTracker.tsx`, `lib/gtm.ts`, `lib/tracking.ts`.

> **Phase 2 note (2026-07-12):** the quiz page is now server-rendered (quiz JSON no longer fetched client-side), so `quiz_started` / the first `quiz_step_view` fire earlier in wall-clock time — right after hydration instead of after two data fetches. Event names, params, order, guards, and once-per-session semantics are unchanged (verified byte-for-byte against the pre-change build with the Playwright walkthrough harness).

---

## Overview

| Layer | Tool | Purpose | Status |
|---|---|---|---|
| Ad optimization | Meta Pixel | Feed Facebook's algorithm to find buyers | ✅ Done |
| Drop-off funnel | GTM → GA4 | See where users abandon the quiz | ✅ Done |
| Tag management | Google Tag Manager `GTM-PG86C8VF` | Already installed, routes events | ✅ Done |

---

---

# PART 1 — META PIXEL

---

## 1. Credentials

- **Pixel ID:** `861394259546340`
- **Dataset ID:** `861394259546340` (Meta now calls pixels "Datasets")
- **Business Account:** Quiz (Meta Business Suite)
- **Ad Account ID:** `3062639437338199`
- **Events Manager:** https://business.facebook.com/events_manager2/list/dataset/861394259546340/overview
- **Test Events:** https://business.facebook.com/events_manager2/list/dataset/861394259546340/test_events

---

## 2. What Meta Pixel Is For

Meta Pixel only receives **ad optimization signals** — events that tell Facebook's algorithm
who to show ads to and who is likely to buy. Keep it lean. Only standard Meta events go here.

Custom funnel analysis (quiz drop-off) does NOT belong in Meta Pixel — that goes in GA4.
See Part 2.

---

## 3. Setup Status

| Task | Status | Notes |
|---|---|---|
| Meta Pixel created | ✅ Done | Dataset ID: 861394259546340 |
| Pixel installed in `layout.tsx` | ✅ Done | Fires PageView on every page load |
| PageView verified in Test Events | ✅ Done | Confirmed 2026-05-07 at 11:35 AM |
| Pixel ID added to Gumroad | ✅ Done | Auto-fires Purchase after payment |
| `src/lib/tracking.ts` created | ✅ Done | See Section 5 |
| `Lead` event wired up | ✅ Done | Via `useQuizFlow.ts` — see Section 6a |
| `ViewContent` event wired up | ✅ Done | Via `ResultPageStep.tsx` — see Section 6c |
| `InitiateCheckout` event wired up | ✅ Done | Via `ResultPageStep.tsx` — see Section 6c |
| `MetaPixelTracker.tsx` created | ✅ Done | Fires PageView on every route change via usePathname |
| Auto event detection disabled | ✅ Done | `autoConfig: false` set in `layout.tsx` |
| All events verified in Test Events | ✅ Done | Verified 2026-05-09 via Meta Pixel Helper + Test Events tab |

---

## 4. Events — What Fires and When

5 events total. All standard Meta events.

| Event | Type | When | Guard | Fired From |
|---|---|---|---|---|
| `PageView` | Standard | Every page navigation | None — fires every time | `MetaPixelTracker.tsx` + pixel init in `layout.tsx` |
| `Lead` | Standard | User clicks Female/Male (quiz starts) | Once per session | `useQuizFlow.ts` handleAnswer |
| `ViewContent` | Standard | Result page mounts | Once per session | `ResultPageStep.tsx` useEffect |
| `InitiateCheckout` | Standard | Any "GET MY PLAN" click | None — multiple clicks are valid signals | `ResultPageStep.tsx` CTA buttons |
| `Purchase` | Standard | After Gumroad payment | Gumroad auto-fires via Pixel ID | Gumroad |

**Session guards:** `Lead` and `ViewContent` use a module-scope `firedEvents` Set in `src/lib/tracking.ts`. The Set persists for the entire browser session and resets on full page refresh. No localStorage or cookies needed.

---

## 5. Central Tracking File

All Meta Pixel calls live in one file. No component ever calls `window.fbq` directly.

**File to create:** `src/lib/tracking.ts`

```typescript
// src/lib/tracking.ts
// Central tracking — Meta Pixel ID: 861394259546340
//
// Usage:
//   import { track } from '@/lib/tracking'
//   track.quizStart()
//   track.viewOffer()
//   track.initiateCheckout('offer_card')

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const fbq = (event: string, params?: object) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
};

export const track = {

  // Fired when user clicks Female/Male on the gender landing step
  // Standard Meta event: Lead
  quizStart: () => {
    fbq('Lead', { content_name: 'Body Reset Quiz' });
  },

  // Fired when result page mounts
  // Standard Meta event: ViewContent
  viewOffer: () => {
    fbq('ViewContent', {
      content_name: 'Body Reset Offer',
      content_ids: ['body-reset'],
      content_type: 'product',
      value: 29,
      currency: 'USD',
    });
  },

  // Fired when any "GET MY PLAN" button is clicked
  // Standard Meta event: InitiateCheckout
  // location: 'offer_card' | 'sticky_header'
  initiateCheckout: (location: string) => {
    fbq('InitiateCheckout', {
      content_name: 'Body Reset',
      content_ids: ['body-reset'],
      value: 29,
      currency: 'USD',
      num_items: 1,
      content_category: location,
    });
  },

};
```

---

## 6. Code Changes Required

### 6a. `src/hooks/useQuizFlow.ts`

**Add import at top:**
```typescript
import { track } from '@/lib/tracking';
```

**Inside `handleAnswer` callback, after `setAnswer(currentStep.id, value)`:**
```typescript
// Fire Lead when quiz truly starts (gender step answered)
if (currentStep.type === 'gender-landing') {
    track.quizStart();
}
```

That's it for this file. The Lead fires the moment the user engages.

---

### 6b. `src/steps/result-page-01/ResultPageStep.tsx`

**Add import at top:**
```typescript
import { track } from '@/lib/tracking';
```

**Add ViewContent on mount (near the countdown timer useEffect):**
```typescript
useEffect(() => {
    track.viewOffer();
}, []);
```

**Sticky header CTA — update onClick:**
```typescript
onClick={() => {
    pushEvent('checkout_initiated', { location: 'sticky_header' }); // GTM — keep
    track.initiateCheckout('sticky_header');                          // Meta — add
}}
```

**OfferCard CTA — update onClick (OfferCard sub-component, same file):**
```typescript
onClick={() => {
    pushEvent('checkout_initiated', { location: 'offer_card' }); // GTM — keep
    track.initiateCheckout('offer_card');                          // Meta — add
}}
```

---

## 7. Verification Checklist

Test Events tab: https://business.facebook.com/events_manager2/list/dataset/861394259546340/test_events

- [ ] Visit https://quiz.com → `PageView` fires
- [ ] Click Female or Male on quiz → `Lead` fires
- [ ] Reach result page → `ViewContent` fires with value: 29
- [ ] Click sticky header "GET MY PLAN" → `InitiateCheckout` fires, location: sticky_header
- [ ] Click offer card "GET MY PLAN" → `InitiateCheckout` fires, location: offer_card
- [ ] Complete Gumroad test purchase → `Purchase` fires

---

## 8. Rules

- ❌ Never call `window.fbq()` directly — always use `track.xxx()`
- ❌ Pixel ID and GTM ID are defined in `layout.tsx` and passed as props to `TrackingScripts.tsx` — do not hardcode them elsewhere
- ❌ Do not remove GTM `pushEvent()` calls — both run in parallel
- ❌ Do not send quiz step views to Meta Pixel — that's GA4's job (see Part 2)
- ✅ Tracking is fully suppressed on `/dashboard`, `/login`, and `/members` via `src/components/TrackingScripts.tsx` — neither GTM nor Meta Pixel loads on these routes
- ❌ Do not fire `quiz_answer_selected` on keystroke or checkbox tick — only on Continue for input and checkbox step types

---

---

# PART 2 — GTM → GA4 (NEXT AFTER META IS DONE)

---

## Status: ✅ Done — verified via GTM Preview + GA4 Realtime

---

## Setup Status

| Task | Status | Notes |
|---|---|---|
| GA4 property created | ✅ Done | Measurement ID: G-PNE2DC64TS |
| GA4 Configuration tag in GTM | ✅ Done | Tag: Google Tag G-PNE2DC64TS, fires on all pages |
| GA4 Event tag in GTM | ✅ Done | Tag: Google Analytics GA4 Event, fires on all quiz triggers |
| `quiz_step_view` flowing to GA4 | ✅ Done | Verified via GTM Preview |
| `quiz_answer_selected` fixed | ✅ Done | Now fires on Continue for inputs and checkboxes, not on every keystroke/tick |
| `quiz_completed` fixed | ✅ Done | Now fires correctly when result page mounts |
| Funnel Exploration report | ✅ Done | Built in GA4 as "Funnel (Body Reset)" — steps: quiz_started → Step 5/10/15/20/25 viewed → quiz_completed → checkout_initiated |
| GTM Data Layer Variables created | ✅ Done | dlv - step_index, dlv - step_id, dlv - step_type, dlv - quiz_id, dlv - quiz_name |
| GA4 Event tag parameters fixed | ✅ Done | All 5 custom parameters now passed to GA4 via GTM event parameters — fixed 2026-05-10 |

---

## Funnel Report Details

- **Report name:** Funnel (Body Reset)
- **Location:** GA4 → Explore → Funnel (Body Reset)
- **Steps configured:**
  1. `quiz_started`
  2. `quiz_step_view` where `step_index = 5`
  3. `quiz_step_view` where `step_index = 10`
  4. `quiz_step_view` where `step_index = 15`
  5. `quiz_step_view` where `step_index = 20`
  6. `quiz_step_view` where `step_index = 25`
  7. `quiz_completed`
  8. `checkout_initiated`

- **Note:** Data from before 2026-05-09 is unreliable due to tracking bugs fixed on that date. Only analyze data from 2026-05-09 onwards.

**Important:** Funnel step data (step 5/10/15/20/25) only reliable from 2026-05-10 onwards — GTM was not passing step_index parameter to GA4 before this date. Fixed by adding Data Layer Variables and Event Parameters to the GA4 Event tag in GTM.

## Purchase Drop-off Calculation

GA4 does not track the final purchase — Gumroad handles checkout. To calculate Gumroad drop-off manually:

1. Get `checkout_initiated` count from GA4 funnel for a date range
2. Get actual purchase count from Gumroad dashboard → Sales for the same date range
3. Calculate: `(checkout_initiated - purchases) / checkout_initiated × 100 = Gumroad drop-off %`

Example:
- checkout_initiated = 100
- Gumroad purchases = 60
- Gumroad drop-off = 40% → price or checkout friction issue

If Gumroad drop-off is high (>30%), investigate: price point, checkout page UX, or trust signals.

GA4 Purchase event tracking is not needed at current stage. Revisit if manual cross-referencing becomes tedious at scale.

---

## What This Is For

Quiz drop-off analysis. The goal is to see a funnel like:

```
Step 1 viewed    1,000 users
Step 5 viewed      800 users   ← 20% dropped here
Step 10 viewed     400 users   ← 50% dropped here
Step 15 viewed     200 users
Result page        150 users
```

This tells you which quiz step is killing conversions so you know what to fix or cut.

---

## Why GTM → GA4 (Not Meta Pixel)

GTM already fires `quiz_step_view` with `step_index`, `step_id`, and `step_type`
on every single step change — the data is already flowing. It just has nowhere to go.

GA4 has a built-in **Funnel Exploration** report that visualizes step-by-step drop-off
with zero extra code once connected. Meta Pixel has no equivalent tool for this.

---

## High-Level Setup Plan (Details TBD in a Future Session)

1. Create a **GA4 property** at analytics.google.com (free)
2. In GTM, add a **GA4 Configuration tag** using the GA4 Measurement ID
3. Add a **GA4 Event tag** that fires on the existing `quiz_step_view` GTM event
4. Publish GTM — no code changes needed in the Next.js app
5. In GA4, build a **Funnel Exploration** using `quiz_step_view` + `step_index`

**Estimated effort:** ~30–60 minutes, zero code changes, GTM UI only.

---

## Notes for Future Claude Session on GA4

- GTM ID is `GTM-PG86C8VF` — already installed in `src/app/layout.tsx`
- The relevant GTM event is `quiz_step_view`, fired from `src/hooks/useQuizFlow.ts`
- It already sends: `quiz_id`, `step_index`, `step_id`, `step_type`
- No changes to Next.js code needed — this is purely a GTM + GA4 configuration task
- Check if a GA4 property already exists before creating a new one

---
