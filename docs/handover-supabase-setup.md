# Handover: Supabase setup (for a fresh Claude Code session)
> Written 2026-11-07. Owner: Muhammad Basurah. This is the owner's **first time with Supabase**: explain every step in simple Indonesian, one small step at a time, and say exactly where to click.
> Goal of this session: Supabase is fully set up and the database exists (schema, security rules, storage) on the dev project, with tests. **Nothing else.** Do not build screens.

## 0. How to start (token-saving rules)
1. Read only: this file, `plan/project_checklist.md`, and from `plan/project_handover.md` only sections **5** (quiz data), **6** (database), **10** (what the owner provides), **11** (decisions, only D1, D2, D3, D12, D20) and **14.3** (database tests). Do **not** read the rest, and do not read old code in `src/`.
2. `CLAUDE.md` says to read the plan files at the start. For this session, only follow point 1 above.
3. Another session is building the website UI in the same folder. **Do not touch** `src/app`, `src/components`, `src/content`, `src/lib/ui`. You may create: `supabase/**`, `tests/db/**`, `.env.example`, `docs/**`, `src/types/database.ts`, and edit `plan/project_checklist.md` and `plan/project_handover.md` (status only). Keep edits to `package.json` minimal (add only what you need) and work on a branch `phase-3-supabase` (`git switch -c phase-3-supabase`). Commit often. **Do not push** until the owner says so.
4. The repo is **public** (https://github.com/ememdeee/quiz). Never write a key, password or token in any file that is committed, in chat, or in a log. Never print an environment variable value.

## 1. What is already decided
- **No Docker.** Everything runs against the cloud project. Use the CLI through `npx supabase` (works on Windows without Docker for: `login`, `link`, `db push`, `config push`, `gen types --linked`). Commands that need Docker (`supabase start`, `db reset` local, `test db`) are **not used**.
- **One Supabase project is enough for now**: `quiz-dev` (the owner's existing project, "ememdeee's Project"): project ref `ubyfseqdzzuixvxmabfe`, URL `https://ubyfseqdzzuixvxmabfe.supabase.co`, region Southeast Asia (Singapore, `ap-southeast-1`), Free plan, compute Nano. It is used for development, QC tests and staging. The label "PRODUCTION" next to `main` in the dashboard is just the default branch name; ignore it. **Real customer data must never go in this project.** A second project (production, paid plan) is created much later (Phase 16).
- Why one project now: a Free account can have two active projects, and a second one only helps once there is real data to protect. Tests will create and delete fake people in the dev project, which is fine there.
- Free projects pause after about a week of no activity: if it says "paused", press Restore in the dashboard. Free has no backups; it does not matter for dev data.
- Test emails go to a **Mailtrap sandbox** (decision D20) later, in Phase 4. Not needed in this session.

## 2. Owner steps in the Supabase dashboard (guide the owner through these)
Open https://supabase.com/dashboard/project/ubyfseqdzzuixvxmabfe . Tell the owner **never to paste secrets into the chat**; they paste them into the file `.env.local` that you create.

1. **Create `.env.local`** (git-ignored; check with `git check-ignore .env.local`) from the template in section 3. Open it for the owner in their editor.
2. **API keys:** left menu, the gear **Project Settings**, then **API Keys**. Copy the **Publishable key** (starts with `sb_publishable_`; older projects call it the `anon` key) into `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Copy the **Secret key** (starts with `sb_secret_`; older name `service_role`) into `SUPABASE_SERVICE_ROLE_KEY`. Explain: the publishable key is safe in the browser, the secret key is a master key that only the server may ever use.
3. **Database password:** Project Settings, **Database**, press **Reset database password**, generate a strong one, save it in a password manager, paste it into `SUPABASE_DB_PASSWORD`.
4. **Access token for the CLI:** top right avatar, **Account preferences**, **Access Tokens**, **Generate new token**, name it `quiz-cli`, paste into `SUPABASE_ACCESS_TOKEN`. (Alternative: you run `npx supabase login` and the owner approves in the browser.)
5. Tell the owner to **close** `.env.local` and not share it. You check it only by testing that the commands work, never by printing it.

## 3. `.env.local` template and `.env.example`
Create `.env.example` (committed, **names only, no values**) and make sure it is not ignored: the repo's `.gitignore` has `.env*`, which also hides `.env.example`; add the line `!.env.example` under it.

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ubyfseqdzzuixvxmabfe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_REF=ubyfseqdzzuixvxmabfe
SUPABASE_DB_PASSWORD=
SUPABASE_ACCESS_TOKEN=
IP_HASH_SALT=
```
`IP_HASH_SALT`: you generate a random 32-byte value for the owner (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and write it straight into `.env.local` without echoing it).

## 4. Your work (Claude Code), in order
1. `git switch -c phase-3-supabase`. Check `git status` is clean for your files.
2. `npx supabase init` (creates `supabase/`). When asked about VS Code/IntelliJ settings, say no.
3. `npx supabase link --project-ref ubyfseqdzzuixvxmabfe` (uses the access token and DB password from the environment; do not put them on the command line in a way that is saved to history; use the env vars). If the connection fails (IPv6), use the pooler (the CLI normally does this itself) and tell the owner.
4. **`supabase/config.toml`:** site URL `http://localhost:3000`; additional redirect URLs `http://localhost:3000/**` (add the Vercel preview wildcard later); email sign-ups on, **confirm email on**, password minimum length 8, **`double_confirm_changes = false`**, `secure_password_change` per handover; email OTP expiry: set to **3600** (1 hour) as the working default for D1 (the owner has not confirmed D1 yet, say so in your report); disable anything not needed (anonymous sign-ins off). Google and SMTP stay for Phase 4 (leave them off). Push with `npx supabase config push` and then show the owner where to see the result: **Authentication, Sign In / Providers** and **URL Configuration**.
5. **Migrations** in `supabase/migrations/` (one concern per file, timestamp names from `npx supabase migration new`), implementing handover section 6 exactly:
   - `types_and_tables` (6.1 and 6.2),
   - `functions_and_triggers` (6.3: `handle_new_user`, `touch_updated_at`, `bump_finished_count`, `protect_profile_columns`, `enforce_quiz_limit`, `save_draft`, `publish_quiz`, `start_response`, `finish_response`, `slug_available`, `track_open`, `rate_limit_hit`),
   - `rls` (6.4: RLS on **every** table, policies exactly as the table says; tables with "no policies" simply have RLS on),
   - `storage` (6.5: bucket `quiz-media`, public read, 5 MB limit, image types, owner-only write by first folder = `auth.uid()`),
   - `private_admin` (a `private` schema with the admin helper functions; the `private` schema must **not** be exposed through the API; check Project Settings, **Data API**, exposed schemas = `public` only),
   - `pg_cron` cleanup jobs only if the extension can be enabled on the Free plan; otherwise note it as a TODO.
   Rules: plan default limits (**5 quizzes / 15 pages / 500 finished responses**) live in **one** SQL function `private.plan_limits(profile)`; add a note that the same numbers exist in `src/lib/plan/limits.ts` (written in another phase) and a test later must compare them. Every function that is `security definer` sets `search_path` explicitly and is **not** executable by `anon`. Revoke default `public` execute on new functions, then grant only what is needed. Public quiz reads and writes (`start_response`, `finish_response`, `track_open`) are called by server code with the service role, so they are **not** granted to `anon` or `authenticated`.
6. `npx supabase db push` to apply. Then run these checks (SQL through `npx supabase db query` if available in this CLI version, or through a small Node script using the secret key; **or** ask the owner to paste a query into the dashboard SQL Editor): every table in `public` has `rowsecurity = true`; list of policies; the storage bucket exists with the right limits; the `private` schema is not exposed.
7. `npx supabase gen types typescript --linked > src/types/database.ts` (commit it).
8. **Database tests** (no Docker): add `vitest` and `@supabase/supabase-js` as dev dependencies if missing, create `tests/db/` with a helper that (a) refuses to run unless `NEXT_PUBLIC_SUPABASE_URL` contains `ubyfseqdzzuixvxmabfe`, (b) creates 2 or 3 real test people with the Auth admin API (`qc-<random>@example.test`, email confirmed), signs in as each with the publishable key, (c) deletes them at the end. Write the tests listed in handover **14.3**: a stranger sees nothing; person A cannot read or change person B's rows in every table; a person cannot change their own role, plan, status, limits; the 6th quiz is refused on Free and allowed after a limit override; `save_draft` conflict, ownership and page limit; `finish_response` limit and the concurrency case; slug uniqueness (case-insensitive) and holds; cascades on delete; storage folder rules and limits; admin helpers not callable by normal people. Add `npm run test:db`. All must pass.
9. A script `tests/db/rls-check.ts` (or SQL) that fails if any `public` table has RLS off; add `npm run db:check`.
10. Seed: `supabase/dev-seed.sql` is **optional** in this session; if you do it, it must only run on the dev project and never create real-looking personal data.
11. Update status: tick the relevant Phase 3 items in `plan/project_handover.md` (section 12) **and** `plan/project_checklist.md`, record decisions (D1 working default), and add anything new you learned. Update `Last Updated`.
12. Commit on the branch. Report to the owner (see section 6). Ask before pushing.

## 5. Things to explain to the owner in simple words (when they come up)
- **Supabase** = the place that holds our database, our login system and our uploaded pictures. **Migration** = a small file of database changes; the database is only ever changed through migrations, never by clicking in the dashboard. **RLS** = rules in the database that stop people from seeing each other's data, even if our code has a bug.
- **Publishable vs secret key:** one is safe to show, one is a master key that must stay on the server and in `.env.local`.
- **Why not paste keys in chat:** the repo is public and chats can be stored; a leaked secret key gives full access to every user's data. If a key is ever leaked: Project Settings, API Keys, roll/regenerate it, update `.env.local`.

## 6. Done when (report these to the owner, in Indonesian, short)
- `npx supabase link` works; `.env.local` exists, is git-ignored, and was never printed.
- `config push` applied; the owner has seen the Auth settings in the dashboard.
- All migrations applied to the dev project; every table has RLS on; storage bucket exists; `private` schema not exposed.
- `src/types/database.ts` generated.
- `npm run test:db` and `npm run db:check` pass.
- Plan files updated; work committed on `phase-3-supabase`, not pushed.
- A short list of anything unexpected (for example CLI limits without Docker, IPv6 connection, a Free-plan limitation for `pg_cron`) and the next steps: Phase 4 (auth: needs Google Cloud OAuth client and a Mailtrap sandbox from the owner).

## 7. Do not
- Do not create a second Supabase project or upgrade the plan.
- Do not use `db reset --linked` unless the owner explicitly asks (it wipes the dev project).
- Do not enable or change anything in the dashboard that the migrations or `config.toml` can do; the code is the source of truth.
- Do not touch the website code or design. If something in the design is missing for the database, write it in `plan/project_handover.md` section 13 and tell the owner.
