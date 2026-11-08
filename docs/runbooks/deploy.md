# Deploy (first time and every time)

> Last Updated: 2026-11-08. Everything marked **Owner** needs an account or a decision only the owner can give.

## Before anything goes to production

`npm run release-check` must be green (lint, typecheck, unit tests, build), and these must pass against the dev project and staging:

```
npm run test:db && npm run db:check      # database rules and row-level security
npm run qc:links && npm run qc:a11y      # every page, link, button; accessibility
npm run qc:real                          # sign-in, quizzes, answering, account, admin, contact on Supabase
npm run qc:prod                          # the production build: headers, policy, icons, performance, smoke
```

Run them twice in a row. Fix everything that fails; do not skip a test.

## First time: the accounts (Owner)

1. **Supabase production project** on a paid plan (daily backups). Region close to the people who use it.
2. **Vercel**: import the GitHub repo https://github.com/ememdeee/quiz. Framework: Next.js. Production branch: `main`.
3. **Domain**: `quiz.basrh.com`. In Vercel add the domain; at the DNS host of `basrh.com` add the CNAME Vercel shows.
4. **Resend**: add and verify the domain (SPF, DKIM, DMARC records at the DNS host). Create an API key.
5. **Cloudflare Turnstile**: create a widget for the domain. Keep the site key and the secret key.
6. **Sentry**: create a project (Next.js). Keep the DSN.
7. **Google Cloud**: in the OAuth client add the production redirect URI shown in Supabase (Authentication > Providers > Google).

## First time: the database

```
node scripts/with-env.mjs npx supabase link --project-ref <production ref>
node scripts/with-env.mjs npx supabase db push          # the 7 migrations
npm run emails:export                                    # rebuild the auth email HTML from emails/
node scripts/with-env.mjs npx supabase config push       # auth settings, redirect URLs, SMTP, email templates
```

`config push` shows what it will change and asks for consent: read it. In Supabase set **Site URL** to `https://quiz.basrh.com` and add `https://quiz.basrh.com/**` to the redirect URLs. Turn on **Custom SMTP** with the Resend settings (host `smtp.resend.com`, user `resend`, password = the API key, sender `hello@quiz.basrh.com`).

## Environment variables in Vercel (Production)

Names are listed in `.env.example`. Set at least:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_DATA_MODE` | `supabase` |
| `NEXT_PUBLIC_SITE_URL` | `https://quiz.basrh.com` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | from the production project (Settings > API). The service key is secret: never in the browser |
| `IP_HASH_SALT` | a long random string, made once and never changed |
| `RESEND_API_KEY`, `EMAIL_FROM` | the Resend key and `Quiz <hello@quiz.basrh.com>` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | from Cloudflare |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | from Sentry |
| `MAINTENANCE_MODE` | `on` for the first deploy, then removed |

Do **not** set the Mailtrap variables in production, and remove `MAINTENANCE_MODE` after launch.

## The first production deploy

1. Deploy with `MAINTENANCE_MODE=on`. Everyone sees the maintenance page.
2. Register the owner account on the site, verify the email, then promote it (see `admin.md`).
3. Smoke test by hand: register, log in, make a quiz, publish, answer it on a phone, read the answer, receive the five emails.
4. Remove `MAINTENANCE_MODE`, redeploy. Submit `https://quiz.basrh.com/sitemap.xml` to Google Search Console.
5. Check Sentry receives a test error, the uptime monitor watches `/api/health`, and backups ran.
6. Tag `v1.0.0` on GitHub.

## Every later deploy

Pull request, CI green, check the Vercel preview, merge. Database migrations are forward-only: write each migration so it is safe to run **before** the code that uses it (add a column before the code reads it; remove it only after no code uses it). Run `supabase db push` first, then merge.

The first week: look at Sentry, the Supabase logs, Resend deliveries, sign-ups and the admin Overview every day.
