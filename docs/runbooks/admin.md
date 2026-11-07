# Running the product (the owner's guide)

> Last Updated: 2026-11-08

## Make the owner an admin (once)

Register normally and verify the email. Then in the Supabase SQL editor (production project):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR-EMAIL');
```

Log out and in. The account menu now has **Admin**. Only this SQL can make an admin; there is no button for it on purpose.

## Day to day, in the Admin area

- **Overview**: sign-ups, quizzes and responses, who has not verified their email, who is close to a Free limit.
- **Users**: search, filter, download CSV. Open a person to change the plan.
- **Custom plan**: set Custom, switch on brand colors and "hide Powered by Quiz" if agreed, write the custom domain (it is only stored, nothing routes it yet), and set the limits. Leave a limit empty to use the Free number. Choosing Free again clears all of it.
- **Suspend** closes the person's quizzes ("This quiz is closed") and blocks login. Nothing is deleted. **Restore** brings it all back.
- **Delete** asks you to type their email and removes the account, quizzes, answers and pictures for good.
- You cannot see anyone's answers, and you cannot suspend or delete your own account.
- Every plan change, suspend, restore and delete is written to the `admin_log` table (who, what, when).

## Messages from the contact form

Each message is emailed to basurah@basrh.com with the visitor as reply-to, and a copy is saved in the `contact_messages` table in case the email fails.

## Rotating keys

- **Supabase service key and anon key**: Settings > API > rotate, then update Vercel and redeploy.
- **Resend key, Turnstile secret, Sentry DSN**: create a new one, update Vercel, redeploy, delete the old one.
- **`IP_HASH_SALT`**: changing it only resets the sign-in lock counters and rate limits for a day; do it if it ever leaks.
- **Google OAuth secret**: rotate in Google Cloud, then paste it in Supabase (Authentication > Providers > Google).

## Adding a quiz template

Add one file under `src/lib/quiz/templates/`, list it in `index.ts`, and describe it on the New quiz dialog board in Claude Design first.
