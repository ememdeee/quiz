# Handover: Google login (Google Cloud OAuth client + Supabase Google provider)
> Written 2026-11-07. Owner: Muhammad Basurah. The owner is a beginner: explain every step in simple Indonesian, **one small step at a time**, and say exactly where to click. Ask for a screenshot when the Google screen differs from what you expect (Google changes its screens often).
> Goal of this session: Google sign-in is configured end to end on the dev project (Google side + Supabase side). **Nothing else.** Do not build screens and do not touch the website code.

## 0. How to start (token-saving rules)
1. Read only: this file, `plan/project_checklist.md`, and from `plan/project_handover.md` sections **8.2** (register, log in), **10** (what the owner provides, rows 4 and 5) and **11** (only D2). Do not read the rest. `CLAUDE.md` says to read all plan files; for this session follow this point instead.
2. Do not touch `src/app`, `src/components`, `src/content`, `src/lib/ui`. You may create or edit: `supabase/config.toml`, `.env.example`, `docs/**`, and the status lines in `plan/project_checklist.md` and `plan/project_handover.md`. Another session may be editing the website in the same folder.
3. Git: the database work is on branch `phase-3-supabase` (not pushed). Start with `git switch phase-3-supabase` and then `git switch -c phase-4-google`. Commit often. **Do not push** until the owner says so.
4. The repo is **public**. Never write a secret in a committed file, in chat, or in a log. Never print an environment variable value. **Never ask the owner to paste the Client Secret into the chat.** The owner pastes it into `.env.local`.
5. CLI notes (no Docker): use `--remote` (`supabase config push` works as is). Run CLI commands through `node scripts/with-env.mjs <command>` so `.env.local` is loaded exactly as written (passwords with special characters break in the shell). Use `--yes` for non-interactive hosted changes.

## 1. What is already decided or done
- Supabase dev project: ref `ubyfseqdzzuixvxmabfe`, URL `https://ubyfseqdzzuixvxmabfe.supabase.co`, linked, config already pushed once.
- **D2 is approved by the owner (2026-11-07):** Supabase automatically links a Google login to an existing password account with the same verified email. Keep Supabase's default (do not turn this off), and the design board `LoginGoogleExists` will be removed in Claude Design (not your job).
- **Owner's progress so far:** the Google Cloud project **`quiz`** (project id `quiz-514006`) exists, and the owner is on the "Google Auth Platform" overview page (`console.cloud.google.com/auth/overview?project=quiz-514006`). It says "You haven't configured any OAuth clients for this project yet". Branding, Audience and Clients are not done yet (verify with the owner by screenshot).
- Google sign-in goes through Supabase Auth, so the redirect goes to **Supabase**, not to our website:
  `https://ubyfseqdzzuixvxmabfe.supabase.co/auth/v1/callback`

## 2. Steps for the owner in Google Cloud (guide one at a time)
Use the left menu of **Google Auth Platform** (Overview, Branding, Audience, Clients, Data Access).
1. **Branding:** app name `Quiz` (the product name can change later), user support email = the owner's email, developer contact email = the owner's email. Logo and domains are optional now (the real domain is not bought yet, decision D9). Save.
2. **Audience:** user type **External**. Leave the publishing status as **Testing** for now. In Testing mode only listed **test users** can sign in, so add the owner's Google email (and any other tester) under **Test users**. Moving to "In production" happens in Phase 16.
3. **Data Access:** the default basic scopes are enough (`openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`). Add nothing else (no sensitive scopes: they trigger Google's review).
4. **Clients:** **Create client**, application type **Web application**, name `quiz-dev`.
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `https://ubyfseqdzzuixvxmabfe.supabase.co/auth/v1/callback`
   - Create. Google shows the **Client ID** and **Client secret**. The owner copies both into a password manager and into `.env.local` (step 3). Tell them the secret can be viewed again later in the client's page, and can be reset if it leaks.
5. Production later (Phase 16, not now): a second client or extra origins/redirects for the real domain, and Publishing status "In production".

## 3. Your work (Claude Code)
1. Add to `.env.example` (names only, committed): `GOOGLE_CLIENT_ID=` and `GOOGLE_CLIENT_SECRET=`. Open `.env.local` for the owner in the editor (`open_in_editor`) and tell them to paste the two values there (no spaces, no quotes), save, and close it. Check only that the variables are non-empty (a script that prints booleans, never values).
2. In `supabase/config.toml` enable the provider with environment substitution so no secret is committed:
   ```
   [auth.external.google]
   enabled = true
   client_id = "env(GOOGLE_CLIENT_ID)"
   secret = "env(GOOGLE_CLIENT_SECRET)"
   skip_nonce_check = false
   ```
   (Check the exact key names in the existing `config.toml`; the section is probably already there with `enabled = false`.) Keep `enable_manual_linking = false` and do not change the other auth settings.
3. `node scripts/with-env.mjs npx supabase config push --yes`. Read the diff it prints: only the Google provider (and nothing surprising) should change. Never print secrets.
4. Show the owner where to see it: Supabase dashboard, **Authentication, Sign In / Providers, Google** (enabled, Client ID filled; the secret is hidden).
5. **Check it works** without building the website: ask Supabase for the Google authorize URL and confirm Google accepts it (the redirect URI must match). For example open `https://ubyfseqdzzuixvxmabfe.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000` in the browser: it should show Google's account chooser, not an error like `redirect_uri_mismatch`. If it fails, compare the redirect URI character by character (no trailing slash, `https`). A full sign-in test happens in Phase 4 when the login screen exists.
6. Update status: in `plan/project_checklist.md` tick "Google Cloud OAuth client" (section C); in `plan/project_handover.md` section 10 row 5 and the Phase 4 text, note what is done. Update `Last Updated`. Commit on the branch.
7. Report to the owner in Indonesian, short: what is done, what is not (the real sign-in test), and next steps. Ask before pushing.

## 4. Explain to the owner in simple words (when it comes up)
- **OAuth client** = the "ID card" of our app at Google. With it, Google knows which app is asking and where to send the person back after they pick their account.
- **Client ID** is not secret. **Client secret** is secret: only the server uses it. It lives in `.env.local` and in Supabase, never in chat or in a committed file.
- **Testing vs In production:** in Testing only the people listed as test users can sign in with Google. Before launch we switch it, and Google may ask for a privacy policy and a domain.

## 5. Done when
- A Google OAuth client `quiz-dev` exists, the redirect URI is exactly the Supabase callback above.
- `.env.local` has the two values (never printed); `.env.example` lists the names.
- `config push` applied; the Google provider shows as enabled in the Supabase dashboard.
- The authorize URL opens Google's account chooser with no error.
- Plan files updated; committed on the branch, not pushed.

## 6. Do not
- Do not create a second Supabase project, change the plan, or touch website code or design.
- Do not enable the provider by clicking in the dashboard when `config.toml` can do it (the code is the source of truth).
- Do not add Google scopes beyond email and profile.
