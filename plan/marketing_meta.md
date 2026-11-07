# Meta Ads Reference
> Last Updated: 2026-05-10
> Maintained by: Claude

---

## Account Structure

| Account | ID | Purpose |
|---|---|---|
| Sendeez | Business portfolio | Owns the pixel and ad account |
| Muchammad Bin Hasyim Basurrah | 1272714275007539 | Active ad account under Sendeez — run ALL ads from here |
| Es Puter Sendeez | Personal | Do NOT use for ads — wrong account |

**Always run ads from Sendeez → Muchammad Bin Hasyim Basurrah account.**

---

## Pixel

- **Pixel ID:** `861394259546340`
- **Dataset ID:** `861394259546340`
- **Business:** Quiz (under Sendeez portfolio)
- **Events Manager:** https://business.facebook.com/events_manager2/list/dataset/861394259546340/overview
- **Test Events:** https://business.facebook.com/events_manager2/list/dataset/861394259546340/test_events
- **Status:** Active, installed on quiz.com via `layout.tsx`

### Known Issues
- `SubscribedButtonClick` auto-fires — caused by Event Setup Tool used early in setup. Harmless, does not affect ad optimization.
- `Lead` and `InitiateCheckout` show "Blocked by Meta" in Event statuses — this is a historical flag from when domain was categorized as Health & wellness. Events ARE firing correctly in practice as confirmed via Pixel Helper.
- Domain category set to None (unchecked all health categories) to avoid event restrictions.

---

## Events Tracked

| Event | Type | Status | Notes |
|---|---|---|---|
| `PageView` | Standard | ✅ Active | Fires on every route change via MetaPixelTracker.tsx |
| `Lead` | Standard | ✅ Active | Fires once per session when user selects gender |
| `ViewContent` | Standard | ✅ Active | Fires once per session on result page mount |
| `InitiateCheckout` | Standard | ✅ Active | Fires on every GET MY PLAN click |
| `Purchase` | Standard | ✅ Active | Auto-fired by Gumroad via Pixel ID |

---

## Active Campaign

| Setting | Value |
|---|---|
| Campaign name | Body Reset — Video Test 01 |
| Ad account | Muchammad Bin Hasyim Basurrah (1272714275007539) |
| Objective | Leads |
| Performance goal | Maximize landing page views |
| Budget | Rp 120,000/day (~$7.50 USD) |
| Start date | May 9, 2026 |
| Status | Active |

### Ad Set
| Setting | Value |
|---|---|
| Name | Women 35-60 US |
| Location | United States |
| Age | 35-65+ (suggestion) |
| Gender | Women (suggestion) |
| Advantage+ audience | On |
| Placements | Advantage+ off, default placements |

### Ad
| Setting | Value |
|---|---|
| Name | Body Reset — Hook Video |
| Video | Luna animated story — hook version |
| Copy | "Some changes happen so slowly you don't notice them at first..." (existing Facebook post) |
| Headline | Nothing fit anymore. |
| CTA button | Learn More |
| Destination URL | https://quiz.com/quiz/body-reset-01 |
| UTM parameters | utm_source=facebook&utm_medium=paid&utm_campaign=body-reset-v1 |

---

## Budget Tracking

| Date | Action | Amount |
|---|---|---|
| May 9, 2026 | Initial fund | Rp 200,000 |
| May 9, 2026 | Initial fund | Rp 10,000 |
| May 10, 2026 | Balance remaining | Rp 135,861 |

**Top up plan:** Add Rp 700,000 more to complete 7-day test if first 1-2 days show normal delivery.

---

## How to Check Performance

**Daily check (takes 5 min):**
1. Ads Manager → Sendeez account → Body Reset — Video Test 01
2. Check: Impressions, Reach, Amount spent, Landing page views
3. GA4 → Explore → Funnel (Body Reset) → set date to last 7 days
4. Check funnel drop-off by step group

**Weekly analysis:**
- Compare `checkout_initiated` (GA4) vs purchases (Gumroad dashboard)
- Gumroad drop-off = `(checkout_initiated - purchases) / checkout_initiated × 100`
- If >30% Gumroad drop-off → investigate price/checkout UX

---

## Decision Framework

| Signal | What it means | Action |
|---|---|---|
| High impressions, low clicks | Ad creative not stopping scroll | Test new hook or copy |
| High clicks, low quiz starts | Landing page issue | Check quiz page load speed |
| High quiz starts, low completion | Quiz too long or bad questions | Check GA4 funnel drop-off by step |
| High completion, low checkout | Result page not converting | Improve offer/copy on result page |
| High checkout, low purchase | Gumroad friction | Investigate price or checkout UX |

---

## Facebook Ad Angles (from Business Master)

For future ad creative testing:
1. "Tried everything" frustration angle ← current video uses this
2. Metabolism support through food
3. Eat more of the right foods
4. Short home routines, no equipment
5. Stubborn lower belly, hips, thighs, arms
6. Quick-start transformation angle
7. Hormone-aware body change angle

---

## Notes for Future Claude Sessions

- Always check which ad account is selected before creating campaigns — must be Muchammad Bin Hasyim under Sendeez
- Pixel warning "not active" in new ad accounts is expected — pixel IS working on the website
- Do not create new datasets — use existing `861394259546340`
- First campaign is a 7-day test to prove funnel works — don't scale until at least 1 sale confirmed
- After first sale: duplicate winning ad, test different copy or angle
- Target is women 35-65+ in the US — don't narrow further at this budget level