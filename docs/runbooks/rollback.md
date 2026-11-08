# Rolling back

> Last Updated: 2026-11-08

## The site (code)

Vercel keeps every deployment. In the Vercel dashboard open **Deployments**, find the last good one, and press **Promote to Production** (instant rollback, no rebuild).

## The database

Migrations only go forward. If a migration caused the problem, write a new migration that fixes it and deploy that; do not edit or delete an old migration file. Because each migration is written to be safe before the code that uses it, rolling the code back never needs the database to go back.

## Settings and emails

`supabase config push` changes sign-in settings and the two auth emails. To undo, put the old `supabase/config.toml` (from git) back and push again.

## When it is down

1. Check https://quiz.basrh.com/api/health, the Vercel status and the Supabase status.
2. If it is our deploy: roll back as above.
3. If it is Supabase: show the maintenance page (`MAINTENANCE_MODE=on`) and wait; nothing is lost, saved answers are in the database.
4. Tell the people who write to basurah@basrh.com if it lasts more than an hour.
