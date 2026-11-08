-- Row Level Security (handover 6.4): ON for every table in "public".
-- On top of the policies, table/column privileges are narrowed so that browser roles can only
-- do what the design allows (for example nobody can reset quizzes.finished_count by hand).
-- anon gets NO access to any table. Admins get no extra access: they use server code.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

alter table public.profiles          enable row level security;
alter table public.quizzes           enable row level security;
alter table public.responses         enable row level security;
alter table public.quiz_daily_stats  enable row level security;
alter table public.media             enable row level security;
alter table public.slug_holds        enable row level security;
alter table public.email_changes     enable row level security;
alter table public.login_attempts    enable row level security;
alter table public.rate_limits       enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.admin_log         enable row level security;
-- slug_holds, email_changes, login_attempts, rate_limits, contact_messages, admin_log:
-- RLS on and NO policies, so only the service role can touch them.

-- profiles: read own row; update only "name" (also guarded by the protect_profile_columns trigger)
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- quizzes: the owner has full read / insert / update / delete on their own rows.
-- Columns: a person never writes draft_version, published*, finished_count or timestamps directly
-- (drafts go through save_draft, publishing through publish_quiz).
grant select, delete on public.quizzes to authenticated;
grant insert (owner_id, name, slug, draft) on public.quizzes to authenticated;
grant update (name, slug, accepting_responses, theme, hide_powered_by) on public.quizzes to authenticated;
create policy quizzes_select_own on public.quizzes
  for select to authenticated
  using (owner_id = (select auth.uid()));
create policy quizzes_insert_own on public.quizzes
  for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy quizzes_update_own on public.quizzes
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy quizzes_delete_own on public.quizzes
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- responses: the quiz owner can select and delete. No insert/update from clients at all.
grant select, delete on public.responses to authenticated;
create policy responses_select_owner on public.responses
  for select to authenticated
  using (exists (
    select 1 from public.quizzes q
    where q.id = responses.quiz_id and q.owner_id = (select auth.uid())
  ));
create policy responses_delete_owner on public.responses
  for delete to authenticated
  using (exists (
    select 1 from public.quizzes q
    where q.id = responses.quiz_id and q.owner_id = (select auth.uid())
  ));

-- quiz_daily_stats: the quiz owner can select. Writes only via track_open.
grant select on public.quiz_daily_stats to authenticated;
create policy quiz_daily_stats_select_owner on public.quiz_daily_stats
  for select to authenticated
  using (exists (
    select 1 from public.quizzes q
    where q.id = quiz_daily_stats.quiz_id and q.owner_id = (select auth.uid())
  ));

-- media: the owner has full access to their own rows (path must start with their own folder)
grant select, insert, update, delete on public.media to authenticated;
create policy media_select_own on public.media
  for select to authenticated
  using (owner_id = (select auth.uid()));
create policy media_insert_own on public.media
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and path like (select auth.uid())::text || '/%');
create policy media_update_own on public.media
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and path like (select auth.uid())::text || '/%');
create policy media_delete_own on public.media
  for delete to authenticated
  using (owner_id = (select auth.uid()));
