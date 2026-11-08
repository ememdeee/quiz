# Quiz

A simple quiz maker for people who are not technical: build a quiz from pages, share one link, read the answers. Built with Next.js, Supabase and React Email.

The plan, the rules and the status are in `plan/` (start with `plan/project_checklist.md`). Where things are: `plan/project_structure.md`.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 with dummy data in the browser (no setup needed)
```

Test links for every screen: http://localhost:3000/dev (it does not exist in a production build).

### With the real database

1. Copy `.env.example` to `.env.local` and fill it in (Supabase keys, Google, Mailtrap). Never commit it.
2. Set `NEXT_PUBLIC_DATA_MODE=supabase` and run `npm run dev`.

## Check it

```bash
npm test             # unit tests
npm run lint
npm run test:db      # database rules, against the dev Supabase project
npm run qc:links     # every page, link and button
npm run qc:real      # sign-in, quizzes, answering, account, admin, contact on Supabase
npm run release-check
```

Browser tests use an installed Edge (set `QC_BROWSER=chrome` for Chrome; in CI they use Playwright's own).
