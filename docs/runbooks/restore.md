# Backups and the restore drill

> Last Updated: 2026-11-08

## What is backed up

- Supabase paid plan: daily backups of the database (point-in-time recovery if switched on).
- Pictures are in Supabase Storage (bucket `quiz-media`). They are not part of the database backup: copy them with the weekly job below.
- A weekly manual dump kept **outside** Supabase (an encrypted drive or another cloud), so one account problem cannot take everything.

## Weekly dump

```
node scripts/with-env.mjs npx supabase db dump --linked -f backup-YYYY-MM-DD.sql
node scripts/with-env.mjs npx supabase db dump --linked --data-only -f backup-data-YYYY-MM-DD.sql
```

Keep the last 8 weeks. The files contain emails and answers: store them encrypted and never in the repo.

## The restore drill (do it once before launch, then every quarter)

1. Create a scratch Supabase project (the free plan is fine).
2. `supabase link` to it, then `supabase db push` (the migrations make an empty, correct database).
3. Load the data dump: `psql "<scratch connection string>" -f backup-data-<date>.sql`.
4. Point a local copy of the app at the scratch project (`.env.local`) and run `npm run db:check` and `npm run test:db` against it.
5. Log in as a known person, open a quiz, and open its Responses. If everything is there, the drill worked.
6. Write the date and the result at the bottom of this file. Delete the scratch project.

## Real restore

1. Put the site in maintenance (`MAINTENANCE_MODE=on` in Vercel, redeploy).
2. Restore from the Supabase dashboard backup (or the dump into a fresh project, then change the keys in Vercel).
3. Run `npm run db:check`, then a smoke test, then switch maintenance off.

## Drill log

| Date | Result |
|---|---|
| (not done yet: needs the production project) | |
