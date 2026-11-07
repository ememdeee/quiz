# PRD Result — Course Platform v2.0

## Files Created

| File | Purpose |
|---|---|
| `src/data/courses.json` | Static source of truth — 3 courses, 13 videos |
| `src/lib/courseSchemas.ts` | Zod schemas — validates `courses.json` at build time |
| `src/store/courseStore.ts` | Zustand store — progress tracking, persisted to `localStorage` |
| `src/middleware.ts` | Edge middleware — validates `?token=` against `COURSE_MAGIC_TOKEN` env var |
| `src/app/unauthorized/page.tsx` | Access denied page with help hints |
| `src/app/members/layout.tsx` | Members area shell with header |
| `src/app/members/page.tsx` | Course catalog — stat bar + 3-column card grid |
| `src/app/course/[slug]/page.tsx` | Server component — loads & validates course, injects Wistia script |
| `src/app/course/[slug]/CoursePlayer.tsx` | Client component — Wistia embed, progress bar, video sidebar |
| `.env.local` | `COURSE_MAGIC_TOKEN=1981239` |

## PRD Features Implemented

- **Magic Link** — `?token=` validated at middleware level, fails → `/unauthorized`
- **Wistia API** — `video.bind("end", cb)` auto-marks completion
- **Auto-resume** — loads last watched video from `localStorage` on entry
- **Progress bar** — `(completed / total) × 100` shown live
- **Stale ID purge** — `reconcileProgress()` removes video IDs that no longer exist in JSON
- **Zod validation** — throws at build time if `courses.json` violates schema
- **Zero backend** — fully static + JSON-driven

## Access URLs

| Route | URL |
|---|---|
| Catalog | `http://localhost:3000/members?token=1981239` |
| Course | `http://localhost:3000/course/mastering-basic-coding?token=1981239` |
| No token | Redirects → `/unauthorized` |

> To rotate access: update `COURSE_MAGIC_TOKEN` in Vercel env vars and redeploy.
