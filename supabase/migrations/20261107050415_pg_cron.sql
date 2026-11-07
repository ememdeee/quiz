-- Daily cleanup jobs (handover 6.7), run at 03:17 UTC.
-- pg_cron is available on the Supabase Free plan. If this migration ever fails because the
-- extension is missing, enable it in the dashboard (Database > Extensions) and re-run.

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule('cleanup-login-attempts', '17 3 * * *',
  $$delete from public.login_attempts where created_at < now() - interval '1 day'$$);

select cron.schedule('cleanup-rate-limits', '18 3 * * *',
  $$delete from public.rate_limits where window_start < now() - interval '1 day'$$);

select cron.schedule('cleanup-email-changes', '19 3 * * *',
  $$delete from public.email_changes where expires_at < now()$$);

select cron.schedule('cleanup-slug-holds', '20 3 * * *',
  $$delete from public.slug_holds where expires_at < now()$$);
