---
name: keepalive
description: Wake or keep alive the quiz app's free Supabase project (it pauses after 7 days without activity). Calls https://quiz.basrh.com/api/health/db, then reports whether the database answered. Use when the user says "keepalive", "reset supabase", "cek supabase", or "masih nyala?".
---

# keepalive

Runs one tiny real query on the production database through the app's keep-alive endpoint. That counts as activity and restarts Supabase's 7-day pause timer.

## Steps

1. Run (Bash):
   ```bash
   curl -s -m 60 -w "\nHTTP %{http_code}\n" https://quiz.basrh.com/api/health/db
   ```
2. Read the result:
   - `HTTP 200` and `"ok":true` → the database answered. The timer is reset.
   - `HTTP 503` or `"ok":false` → the app is up but the database did not answer. Most likely the project is **paused**: tell the user to open the Supabase dashboard and press **Restore project**, then run this skill again.
   - `HTTP 404` → the endpoint is not deployed yet (the code is not on `main`). Say so.
   - No answer / timeout → the site itself (Vercel) is down or unreachable.
3. Report in the user's language (Indonesian, casual), short:
   - Status: nyala / mati / ke-pause
   - Response time (`ms`) and the time it checked (`checkedAt`)
   - The next time they need to run it: within 7 days (suggest every ~5 days)

Never print keys or secrets; this endpoint needs none.
